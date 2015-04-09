#!/usr/bin/env node

var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    optimist = require('optimist'),
    extend = require('xtend'),
    SolrProxy = {};

/*
 * Returns true if the request satisfies the following conditions:
 *  - HTTP method (e.g., GET) is in options.validHttpMethods
 *  - Path (eg. /solr/update) is in options.validPaths
 *  - All request query params (eg ?q=, ?stream.url=) not in options.invalidParams
 */
var validateRequest = function(request, options) {
  var parsedUrl = url.parse(request.url, true),
      path = parsedUrl.pathname,
      queryParams = Object.keys(parsedUrl.query);

  return options.validHttpMethods.indexOf(request.method) !== -1 &&
         options.validPaths.indexOf(path) !== -1 &&
         queryParams.every(function(p) {
           var paramPrefix = p.split('.')[0]; // invalidate not just "stream", but "stream.*"
           return options.invalidParams.indexOf(paramPrefix) === -1;
         });
};

var defaultOptions = {
  listenPort: 8008,
  validHttpMethods: ['GET', 'HEAD'],
  validPaths: ['/solr/select'],
  invalidParams: ['qt', 'stream'],
  backend: {
    host: 'localhost',
    port: 8080
  }
};

var createServer = function(options) {
  var proxyTarget = 'http://' + options.backend.host + ':' + options.backend.port;

  var proxy = httpProxy.createProxyServer({target: proxyTarget});

  proxy.on('error', function(err, req, res) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err);
  });

  // adapted from http://git.io/k5dCxQ
  var server = http.createServer(function(request, response) {
    if (validateRequest(request, options)) {
      proxy.web(request, response);
    } else {
      response.writeHead(403, 'Illegal request');
      response.write('solrProxy: access denied\n');
      response.end();
    }
  });
  return server;
};

SolrProxy.start = function(port, options) {
  options = options || {};
  options.backend = extend(defaultOptions.backend, options.backend);
  options = extend(defaultOptions, options);

  port = port || options.listenPort;

  var server = createServer(options);
  server.listen(port);
  return server;
};

module.exports = SolrProxy;

// TODO: Move all this to a cli module
// if invoked directly, (eg "node solr-proxy.js"), start automatically
if (require.main === module) {
  // TODO: refactor these; write tests
  var options = {
    'port':           { description: 'Listen on this port', default: 8008},
    'backendPort':   { description: 'Solr backend port', default: 8080},
    'backendHost':   { description: 'Solr backend host', default: 'localhost'},
    'validPaths':     { description: 'Only allow these paths (comma separated)', default: '/solr/select'},
    'invalidParams':  { description: 'Block these query params (comma separated)', default: 'qt,stream'},
    'validMethods': { description: 'Allow these HTTP methods (comma separated)', default: 'GET,HEAD'},
    'help':           { description: 'Show usage', alias: 'h'},
  };

  var argv = optimist.usage('Usage: $0', options).argv;
  if (argv.help) {
    optimist.showHelp();
  } else {
    var proxyOptions = {
      backend: { port: argv.backendPort, host:argv.backendHost},
      validHttpMethods: argv.validMethods.split(','),
      invalidParams: argv.invalidParams.split(','),
      validPaths: argv.validPaths.split(',')
    };
    SolrProxy.start(argv.port, proxyOptions);
    console.log('solr-proxy: localhost:' + argv.port + ' --> ' + argv.backendHost + ':' + argv.backendPort);
  }
}
