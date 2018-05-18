var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    extend = require('xtend'),
    debug = require('debug')('solr-proxy'),
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
  validHttpMethods: ['GET'],
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
      debug('ALLOWED: ' + request.method + ' ' + request.url);
      proxy.web(request, response);
    } else {
      debug('DENIED: ' + request.method + ' ' + request.url);
      response.writeHead(403, 'Illegal request');
      response.write('solrProxy: access denied\n');
      response.end();
    }
  });
  return server;
};

SolrProxy.start = function(port, options, callback) {
  options = options || {};
  options.backend = extend(defaultOptions.backend, options.backend);
  options = extend(defaultOptions, options);

  port = port || options.listenPort;

  var server = createServer(options);
  server.listen(port, callback);
  return server;
};

module.exports = SolrProxy;
