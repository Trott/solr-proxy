import assert from 'node:assert'
import fs from 'node:fs'
import http, { ServerResponse } from 'node:http'
import https from 'node:https'
import net from 'node:net'
import util from 'node:util'

import { afterEach, beforeEach, describe, it } from 'mocha'

import SolrProxy from '../index.js'

const createSolrTestDouble = function (responseCode: number): http.Server {
  const server = http.createServer(function (req, res) {
    res.writeHead(responseCode)
    res.end()
  })
  return server.listen(8983)
}

const checkResponseCode = util.promisify(function (client: { get: Function }, url: string, expectedCode: number, done: Function) {
  const parsed = new URL(url)
  const options = {
    rejectUnauthorized: false
  }

  client.get(parsed, options, (res: ServerResponse) => {
    assert.strictEqual(res.statusCode, expectedCode)
    done()
  })
})

describe('exports', function () {
  it('should expose a start function', function () {
    assert.strictEqual(typeof SolrProxy.start, 'function')
  })
})

describe('start()', function () {
  let proxy: { close: Function }
  let solrTestDouble: http.Server

  beforeEach(function () {
    solrTestDouble = createSolrTestDouble(200)
  })

  afterEach(async function () {
    proxy.close()
    solrTestDouble.close()
  })

  it('should start a proxy on specified port if port is specified', async function () {
    proxy = await SolrProxy.start(9999)
    await checkResponseCode(http, 'http://localhost:9999/solr/select?q=fhqwhagads', 200)
  })

  it('should not start a proxy on the default port if a different port is specified', async function () {
    proxy = await SolrProxy.start(9999)

    async function get (): Promise<void> {
      return await new Promise(function (resolve, reject) {
        const req = http.get('http://localhost:8008/solr/select?q=fhqwhagads', function (res) {
          reject(new Error('not supposed to get here'))
        })
        req.on('error', function (err: any) {
          assert.strictEqual(err.code, 'ECONNREFUSED')
          resolve()
        })
      })
    }
    await get()
  })

  it('should use options if specified', async function () {
    proxy = await SolrProxy.start(null, { validPaths: '/come/on' })
    await checkResponseCode(http, 'http://localhost:8008/come/on?q=fhqwhagads', 200)
  })

  it('should be able to start with TLS', async function () {
    const options = {
      ssl: {
        key: fs.readFileSync(new URL('fixtures/test_key.pem', import.meta.url)),
        cert: fs.readFileSync(new URL('fixtures/test_cert.pem', import.meta.url))
      }
    }
    proxy = await SolrProxy.start(null, options)
    await checkResponseCode(https, 'https://localhost:8008/solr/select?q=fhqwhagads', 200)
  })
})

describe('proxy server defaults', function () {
  let proxy: { close: Function }
  let solrTestDouble: net.Server | undefined

  beforeEach(async function () {
    proxy = await SolrProxy.start()
  })

  afterEach(function () {
    proxy.close()
    if (solrTestDouble != null) {
      solrTestDouble.close()
    }
  })

  it('should return 502 on proxy error', async function () {
    const server = net.createServer(function (c) {
      c.write('abc\r\n')
      c.end()
    })
    solrTestDouble = server.listen(8983)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads', 502)
  })

  it('should return 200 for a valid request', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads', 200)
  })

  it('should return 404 on POST requests', function (done) {
    solrTestDouble = createSolrTestDouble(200)

    http
      .request({
        hostname: 'localhost',
        port: 8008,
        path: '/solr/select',
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
      .on('response', function (response) {
        assert.strictEqual(response.statusCode, 404)
        done()
      })
      .end('{"q": "fhqwhgads"}')
  })

  it('should return 403 on requests for /solr/admin', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/admin', 403)
  })

  it('should return 403 on request with qt parameter', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&qt=%2Fupdate', 403)
  })

  it('should return 403 on request with stream.url parameter', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&stream.url=EVERYBODYTOTHELIMIT!', 403)
  })

  it('should return 403 if rows param exceeds 200 default', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&rows=201', 403)
  })

  it('should return 403 if start param exceeds 1000 default', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&start=1001', 403)
  })

  it('should return 200 if rows param does not exceed 200 default', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&rows=199', 200)
  })

  it('should return 200 if start param does not exceed 1000 default', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&start=999', 200)
  })

  it('should return permit the query if rows param is not an integer', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&rows=foobar', 200)
  })

  it('should return permit the query if start param is not an integer', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&start=foobar', 200)
  })
})

describe('proxy server rows', function () {
  let proxy: { close: Function }
  let solrTestDouble: http.Server | undefined

  beforeEach(async function () {
    proxy = await SolrProxy.start(null, { maxRows: 100 })
  })

  afterEach(function () {
    proxy.close()
    if (solrTestDouble != null) {
      solrTestDouble.close()
    }
  })

  it('should return 403 if rows param exceeds maximum', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&rows=101', 403)
  })

  it('should return 200 if rows param does not exceed maximum', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&rows=100', 200)
  })

  it('should return 200 if rows param is unspecified', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads', 200)
  })
})

describe('proxy server start', function () {
  let proxy: { close: Function }
  let solrTestDouble: http.Server | undefined

  beforeEach(async function () {
    proxy = await SolrProxy.start(null, { maxStart: 2000 })
  })

  afterEach(function () {
    proxy.close()
    if (solrTestDouble != null) {
      solrTestDouble.close()
    }
  })

  it('should return 403 if start param exceeds maximum', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&start=2001', 403)
  })

  it('should return 200 if start param does not exceed maximum', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads&start=1001', 200)
  })

  it('should return 200 if start param is unspecified', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads', 200)
  })
})
