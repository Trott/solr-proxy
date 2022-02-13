const fastify = require('fastify')

// To enable verbose logging, set environment variable:
//
// $ NODE_DEBUG=solr-proxy solr-proxy
const debug = require('util').debuglog('solr-proxy')

const deny = function (req, res) {
  debug('DENIED: ' + req.method + ' ' + req.url)
  // res.writeHead(403, 'Forbidden')
  // res.write('solrProxy: access denied\n')
  res.code(403).send('Forbidden')
}

/*
 * Returns true if the request satisfies the following conditions:
 *  - HTTP method (e.g., GET) is in options.validHttpMethods
 *  - Path (eg. /solr/update) is in options.validPaths
 *  - All request query params (eg ?q=, ?stream.url=) not in options.invalidParams
 */
const validateRequest = async function (options, req, res) {
  const parsedUrl = new URL(req.url, 'https://www.example.com/')
  const path = parsedUrl.pathname
  const queryParams = Array.from(parsedUrl.searchParams)

  if (options.validPaths.indexOf(path) === -1) {
    return deny(req, res)
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
    return deny(req, res)
  }
  return true
}

const defaultOptions = {
  listenPort: 8008,
  validHttpMethods: ['GET'],
  validPaths: ['/solr/select'],
  invalidParams: ['qt', 'stream'],
  upstream: 'http://localhost:8983',
  maxRows: 200,
  maxStart: 1000
}

const createServer = function (options) {
  debug('Creating server with options: %j', options)

  let server
  if (options.ssl) {
    server = fastify({ https: options.ssl })
  } else {
    server = fastify()
  }

  server.register(require('fastify-http-proxy'), {
    upstream: options.upstream,
    httpMethods: options.validHttpMethods,
    preHandler: validateRequest.bind(null, options)
  })

  server.setErrorHandler(function (err, req, res) {
    debug('ERROR: ' + err)
    // Send error response
    res.status(502).send('Bad gateway')
  })

  return server
}

const SolrProxy = {
  start: async function (port, options = {}) {
    for (const option in defaultOptions) {
      options[option] = options[option] || defaultOptions[option]
    }

    port = port || options.listenPort

    const server = createServer(options)
    await server.listen(port)
    return server
  }
}

module.exports = SolrProxy
