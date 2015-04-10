module.exports = function(argv, logger, SolrProxy) {

  var usageMessage = 'Usage: solr-proxy [options]\n' +
    '\n' +
    'Options:\n' +
    '  --port           Listen on this port                     [default: 8008]\n' +
    '  --backendPort    Solr backend port                       [default: 8080]\n' +
    '  --backendHost    Solr backend host                       [default: "localhost"]\n' +
    '  --validPaths     Allowed paths (comma separated)         [default: "/solr/select"]\n' +
    '  --invalidParams  Blocked parameters (comma separated)    [default: "qt,stream"]\n' +
    '  --validMethods   Allowed HTTP methods (comma separated)  [default: "GET,HEAD"]\n' +
    '  --version, -v    Show version' +
    '  --help, -h       Show this message';

  if (argv.help || argv.h) {
    logger(usageMessage);
    return;
  }

  if (argv.version || argv.v) {
    var version = require('../../package.json').version;
    logger(version);
    return;
  }

  var proxyOptions = {
    backend: {}
  };

  if (argv.backendPort) {
    proxyOptions.backend.port = argv.backendPort;
  }

  if (argv.backendHost) {
    proxyOptions.backend.host = argv.backendHost;
  }

  if (argv.validMethods) {
    proxyOptions.validHttpMethods = argv.validMethods.split(',');
  }

  if (argv.invalidParams) {
    proxyOptions.invalidParams = argv.invalidParams.split(',');
  }

  if (argv.validPaths) {
    proxyOptions.validPaths = argv.validPaths.split(',');
  }

  SolrProxy.start(argv.port, proxyOptions);
  logger('solr-proxy is running...');
};
