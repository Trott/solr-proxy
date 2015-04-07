var vows = require('vows'),
    http = require('http'),
    url = require('url'),
    SolrProxy = require('../solr-proxy.js'),
    vowsHelper = require('./vows-helper.js');

var server;

var startSimpleBackendServer = function(port) {
  server = http.createServer(function (req, res) {
    var params = url.parse(req.url,true).query;

    if (params.proxyError) {
        // Send something invalid to trigger proxyError event
        res.writeHead('abc');
        res.end();
        return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('mock backend processed request');
    res.end();
  });
  server.listen(port);
}

startSimpleBackendServer(9090);
var proxy = SolrProxy.start(8008, { backend: { port: 9090}});

var batch = vowsHelper.testProxyBatch('http://localhost:8008/solr/', {mocked: true});
batch.teardown = function () {
    proxy.close();
    server.close();
};
suite = vows.describe('test-with-mock-backend').addBatch(batch).export(module);
