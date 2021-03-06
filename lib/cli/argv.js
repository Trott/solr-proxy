const createProxyOptions = function (argv) {
  const proxyOptions = {
    backend: {}
  }

  if (argv.backendPort) {
    proxyOptions.backend.port = argv.backendPort
  }

  if (argv.backendHost) {
    proxyOptions.backend.host = argv.backendHost
  }

  if (argv.validMethods) {
    proxyOptions.validHttpMethods = argv.validMethods.split(',')
  }

  if (argv.invalidParams) {
    proxyOptions.invalidParams = argv.invalidParams.split(',')
  }

  if (argv.validPaths) {
    proxyOptions.validPaths = argv.validPaths.split(',')
  }

  if (+argv.maxRows) {
    proxyOptions.maxRows = +argv.maxRows
  }

  if (+argv.maxStart) {
    proxyOptions.maxStart = +argv.maxStart
  }

  return proxyOptions
}

module.exports = function (argv, stdout, SolrProxy) {
  const usageMessage = 'Usage: solr-proxy [options]\n' +
    '\n' +
    'Options:\n' +
    '  --port           Listen on this port                 [default: 8008]\n' +
    '  --backendPort    Solr backend port                   [default: 8983]\n' +
    '  --backendHost    Solr backend host                   [default: "localhost"]\n' +
    '  --validPaths     Allowed paths (comma delimited)     [default: "/solr/select"]\n' +
    '  --invalidParams  Blocked parameters (comma           [default: "qt,stream"]\n' +
    '                   delimited)\n' +
    '  --validMethods   Allowed HTTP methods (comma         [default: "GET"]\n' +
    '                   delimited)\n' +
    '  --maxRows        Maximum rows permitted in a request [default: 200]\n' +
    '  --maxStart       Maximum start offset permitted in a [default: 1000]\n' +
    '                   request\n' +
    '  --quiet, -q      Do not write messages to STDOUT\n' +
    '  --version, -v    Show version\n' +
    '  --help, -h       Show this message'

  if (argv.help || argv.h) {
    stdout(usageMessage)
    return
  }

  if (argv.version || argv.v) {
    const version = require('../../package.json').version
    stdout(version)
    return
  }

  if (argv.quiet || argv.q) {
    // quiet mode, change stdout to a no-op
    stdout = function () {}
  }

  const proxyOptions = createProxyOptions(argv)

  SolrProxy.start(argv.port, proxyOptions)
  stdout('solr-proxy is running...')
}
