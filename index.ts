import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'node:http'

import { fastify } from 'fastify'
import { fastifyHttpProxy } from '@fastify/http-proxy'
import { debuglog } from 'node:util'

// To enable verbose logging, set environment variable:
//
// $ NODE_DEBUG=solr-proxy solr-proxy
const debug = debuglog('solr-proxy')

const deny = async function (req: FastifyRequest, res: FastifyReply): Promise<void> {
  debug('DENIED: ' + req.method + ' ' + req.url)
  await res.code(403).send('Forbidden')
}

/*
 * Returns true if the request satisfies the following conditions:
 *  - HTTP method (e.g., GET) is in options.validHttpMethods
 *  - Path (eg. /solr/update) is in options.validPaths
 *  - All request query params (eg ?q=, ?stream.url=) not in options.invalidParams
 */
const validateRequest = async function (options: SolrProxyOptions, req: FastifyRequest, res: FastifyReply): Promise<boolean> {
  const parsedUrl = new URL(req.url, 'https://www.example.com/')
  const path = parsedUrl.pathname
  const queryParams = Array.from(parsedUrl.searchParams)

  if (!options.validPaths.includes(path)) {
    await deny(req, res)
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

    return options.invalidParams.includes(paramPrefix)
  })) {
    await deny(req, res)
    return false
  }
  return true
}

interface SolrProxyOptions {
  listenHost: string
  listenPort: number
  validHttpMethods: string[]
  validPaths: string[]
  invalidParams: string[]
  upstream: string
  maxRows: number
  maxStart: number
  ssl?: object
}

const createServer = async function (options: SolrProxyOptions): Promise<FastifyInstance> {
  debug('Creating server with options: %j', options)

  let server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
  >

  if (options.ssl != null) {
    server = fastify({ https: options.ssl })
  } else {
    server = fastify()
  }

  server.setErrorHandler(async function (err, req, res) {
    debug(`ERROR: ${err.message}`)
    // Send error response
    await res.status(502).send('Bad gateway')
  })

  await server.register(fastifyHttpProxy, {
    upstream: options.upstream,
    httpMethods: options.validHttpMethods,
    preHandler: validateRequest.bind(null, options)
  })

  return server
}

const SolrProxy = {
  // TODO: Breaking change: Remove variadic function signature here to match
  // the fastify@5 listen() signature. Wait until fastify@5 is released.
  start: async function (port?: any, userOptions = {} as any) {
    const defaultOptions: SolrProxyOptions = {
      listenHost: 'localhost',
      listenPort: 8008,
      validHttpMethods: ['GET'],
      validPaths: ['/solr/select'],
      invalidParams: ['qt', 'stream'],
      upstream: 'http://localhost:8983',
      maxRows: 200,
      maxStart: 1000
    }

    const options = Object.assign(defaultOptions, userOptions)

    const host = options.listenHost
    port = +port > 0 ? +port : options.listenPort

    const server = await createServer(options)
    await server.listen({ host, port })
    return server
  }
}

export default SolrProxy
