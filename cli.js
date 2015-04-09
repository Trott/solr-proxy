#!/usr/bin/env node

var optimist = require('optimist');
var SolrProxy = require('./');

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
