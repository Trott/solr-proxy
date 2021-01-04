const httpProxy = require('http-proxy')
const extend = require('xtend')
const debug = require('debug')('solr-proxy')

/*
 * Returns true if the request satisfies the following conditions:
 *  - HTTP method (e.g., GET) is in options.validHttpMethods
 *  - Path (eg. /solr/update) is in options.validPaths
 *  - All request query params (eg ?q=, ?stream.url=) not in options.invalidParams
 */
const validateRequest = function (request, options) {
  const parsedUrl = new URL(request.url, 'https://www.example.com/')
  const path = parsedUrl.pathname
  const queryParams = Array.from(parsedUrl.searchParams)

  if (options.validHttpMethods.indexOf(request.method) === -1) {
    return false
  }

  if (options.validPaths.indexOf(path) === -1) {
    return false
  }

  if (queryParams.some(function (p) {
    // This function should return "true" for invalid cases. Confusing, I know.
    const paramPrefix = p[0].split('.')[0] // invalidate not just "stream", but "stream.*"

    if (paramPrefix === 'rows') {
      const rows = +p[1]
      if (rows > options.maxRows) {
        return true
      }
    }

    if (paramPrefix === 'start') {
      const start = +p[1]
      if (start > options.maxStart) {
        return true
      }
    }

    return options.invalidParams.indexOf(paramPrefix) !== -1
  })) {
    return false
  }

  return true
}

const defaultOptions = {
  listenPort: 8008,
  validHttpMethods: ['GET'],
  validPaths: ['/solr/select'],
  invalidParams: ['qt', 'stream'],
  backend: {
    host: 'localhost',
    port: 8983
  },
  maxRows: 200,
  maxStart: 1000
}

const createServer = function (options) {
  const proxy = httpProxy.createProxyServer({ target: options.backend })

  proxy.on('error', function (err, req, res) {
    res.writeHead(502, { 'Content-Type': 'text/plain' })
    res.end('Proxy error: ' + err)
  })

  let createServer
  if (options.ssl) {
    const https = require('https')
    createServer = (callback) => https.createServer(options.ssl, callback)
  } else {
    const http = require('http')
    createServer = http.createServer
  }

  // adapted from https://git.io/k5dCxQ
  const server = createServer(function (request, response) {
    if (validateRequest(request, options)) {
      debug('ALLOWED: ' + request.method + ' ' + request.url)
      proxy.web(request, response)
    } else {
      debug('DENIED: ' + request.method + ' ' + request.url)
      response.writeHead(403, 'Illegal request')
      response.write('solrProxy: access denied\n')
      response.end()
    }
  })
  return server
}

const SolrProxy = {
  start: function (port, options) {
    options = options || {}
    options.backend = extend(defaultOptions.backend, options.backend)
    options = extend(defaultOptions, options)

    port = port || options.listenPort

    const server = createServer(options)
    server.listen(port)
    return server
  }
}

module.exports = SolrProxy
