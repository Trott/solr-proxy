var Code = require('code')

var Lab = require('@hapi/lab')
var lab = exports.lab = Lab.script()

var expect = Code.expect
var describe = lab.experiment
var it = lab.test
var beforeEach = lab.beforeEach
var afterEach = lab.afterEach

var fs = require('fs')
var http = require('http')
var https = require('https')
var net = require('net')
var { URL } = require('url')
var util = require('util')

var SolrProxy = require('../index.js')

var createSolrTestDouble = function (responseCode) {
  var server = http.createServer(function (req, res) {
    res.writeHead(responseCode)
    res.end()
  })
  return server.listen(8080)
}

var checkResponseCode = util.promisify(function (client, url, expectedCode, done) {
  const parsed = new URL(url)
  const options = {
    port: parsed.port,
    path: parsed.pathname + parsed.search,
    rejectUnauthorized: false
  }

  client.get(options, (res) => {
    expect(res.statusCode).to.equal(expectedCode)
    done()
  })
})

describe('exports', function () {
  it('should expose a start function', function () {
    expect(typeof SolrProxy.start).to.equal('function')
  })
})

describe('start()', function () {
  var proxy
  var solrTestDouble

  beforeEach(function () {
    solrTestDouble = createSolrTestDouble(200)
  })

  afterEach(function () {
    proxy.close()
    solrTestDouble.close()
  })

  it('should start a proxy on specified port if port is specified', async function () {
    proxy = SolrProxy.start(9999)
    await checkResponseCode(http, 'http://localhost:9999/solr/select?q=fhqwhagads', 200)
  })

  it('should not start a proxy on the default port if a different port is specified', util.promisify(function (_, done) {
    proxy = SolrProxy.start(9999)

    http
      .get('http://localhost:8008/solr/select?q=fhqwhagads')
      .on('error', function (err) {
        expect(err.code).to.equal('ECONNREFUSED')
        done()
      })
  }))

  it('should use options if specified', async function () {
    proxy = SolrProxy.start(null, { validPaths: '/come/on' })
    await checkResponseCode(http, 'http://localhost:8008/come/on?q=fhqwhagads', 200)
  })

  it('should be able to start with TLS', async function () {
    var options = {
      ssl: {
        key: fs.readFileSync(`${__dirname}/fixtures/test_key.pem`),
        cert: fs.readFileSync(`${__dirname}/fixtures/test_cert.pem`)
      }
    }
    proxy = SolrProxy.start(null, options)
    await checkResponseCode(https, 'https://localhost:8008/solr/select?q=fhqwhagads', 200)
  })
})

describe('proxy server defaults', function () {
  var proxy
  var solrTestDouble

  beforeEach(function () {
    proxy = SolrProxy.start()
  })

  afterEach(function () {
    proxy.close()
    if (solrTestDouble.close) {
      solrTestDouble.close()
    }
  })

  it('should return 502 on proxy error', async function () {
    var server = net.createServer(function (c) {
      c.write('abc\r\n')
      c.end()
    })
    solrTestDouble = server.listen(8080)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads', 502)
  })

  it('should return 200 for a valid request', async function () {
    solrTestDouble = createSolrTestDouble(200)
    await checkResponseCode(http, 'http://localhost:8008/solr/select?q=fhqwhagads', 200)
  })

  it('should return 403 on POST requests', util.promisify(function (_, done) {
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
        expect(response.statusCode).to.equal(403)
        done()
      })
      .end('{"q": "fhqwhgads"}')
  }))

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
  var proxy
  var solrTestDouble

  beforeEach(function () {
    proxy = SolrProxy.start(null, { maxRows: 100 })
  })

  afterEach(function () {
    proxy.close()
    if (solrTestDouble.close) {
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
  var proxy
  var solrTestDouble

  beforeEach(function () {
    proxy = SolrProxy.start(null, { maxStart: 2000 })
  })

  afterEach(function () {
    proxy.close()
    if (solrTestDouble.close) {
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
