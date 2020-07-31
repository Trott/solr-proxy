var { URL } = require('url')
var httpProxy = require('http-proxy')
var extend = require('xtend')
var debug = require('debug')('solr-proxy')
var SolrProxy = {}

/*
 * Returns true if the request satisfies the following conditions:
 *  - HTTP method (e.g., GET) is in options.validHttpMethods
 *  - Path (eg. /solr/update) is in options.validPaths
 *  - All request query params (eg ?q=, ?stream.url=) not in options.invalidParams
 */
var validateRequest = function (request, options) {
  var parsedUrl = new URL(request.url, 'https://www.example.com/')
  var path = parsedUrl.pathname
  var queryParams = Array.from(parsedUrl.searchParams)

  if (options.validHttpMethods.indexOf(request.method) === -1) {
    return false
  }

  if (options.validPaths.indexOf(path) === -1) {
    return false
  }

  if (queryParams.some(function (p) {
    // This function should return "true" for invalid cases. Confusing, I know.
    var paramPrefix = p[0].split('.')[0] // invalidate not just "stream", but "stream.*"

    if (paramPrefix === 'rows') {
      var rows = +p[1]
      if (rows > options.maxRows) {
        return true
      }
    }

    if (paramPrefix === 'start') {
      var start = +p[1]
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

var defaultOptions = {
  listenPort: 8008,
  validHttpMethods: ['GET'],
  validPaths: ['/solr/select'],
  invalidParams: ['qt', 'stream'],
  backend: {
    host: 'localhost',
    port: 8080
  },
  maxRows: 200,
  maxStart: 1000
}

var createServer = function (options) {
  var proxy = httpProxy.createProxyServer({ target: options.backend })

  proxy.on('error', function (err, req, res) {
    res.writeHead(502, { 'Content-Type': 'text/plain' })
    res.end('Proxy error: ' + err)
  })

  var createServer
  if (options.ssl) {
    const https = require('https')
    createServer = (callback) => https.createServer(options.ssl, callback)
  } else {
    const http = require('http')
    createServer = http.createServer
  }

  // adapted from https://git.io/k5dCxQ
  var server = createServer(function (request, response) {
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

SolrProxy.start = function (port, options) {
  options = options || {}
  options.backend = extend(defaultOptions.backend, options.backend)
  options = extend(defaultOptions, options)

  port = port || options.listenPort

  var server = createServer(options)
  server.listen(port)
  return server
}

module.exports = SolrProxy
