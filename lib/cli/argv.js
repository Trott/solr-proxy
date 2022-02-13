const createProxyOptions = function (argv) {
  const proxyOptions = {}

  if (argv.upstream) {
    proxyOptions.upstream = argv.upstream
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

module.exports = async function (argv, stdout, SolrProxy) {
  const usageMessage = 'Usage: solr-proxy [options]\n' +
    '\n' +
   'Options:\n' +
   '--port          Listen on this port         [default: 8008]\n' +
   '--upstream      Solr backend                [default: "http://localhost:8983"]\n' +
   '--validPaths    Allowed paths (comma        [default: "/solr/select"]\n' +
   '                delimited)\n' +
   '--invalidParams Blocked parameters (comma   [default: "qt,stream"]\n' +
   '                delimited)\n' +
   '--validMethods  Allowed HTTP methods (comma [default: "GET"]\n' +
   '                delimited)\n' +
   '--maxRows       Maximum rows permitted in a [default: 200]\n' +
   '                request\n' +
   '--maxStart      Maximum start offset        [default: 1000]\n' +
   '                permitted in a request\n' +
   '--quiet, -q     Do not write messages to STDOUT\n' +
   '--version, -v   Show version\n' +
   '--help, -h      Show this message'

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

  await SolrProxy.start(argv.port, proxyOptions)
  stdout('solr-proxy is running...')
}
