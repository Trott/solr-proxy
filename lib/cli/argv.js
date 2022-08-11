import fs from 'fs';
const createProxyOptions = function (argv) {
    const proxyOptions = {};
    if (argv.host != null) {
        proxyOptions.listenHost = argv.host;
    }
    if (argv.upstream != null) {
        proxyOptions.upstream = argv.upstream;
    }
    if (argv.validMethods != null) {
        proxyOptions.validHttpMethods = argv.validMethods.split(',');
    }
    if (argv.invalidParams != null) {
        proxyOptions.invalidParams = argv.invalidParams.split(',');
    }
    if (argv.validPaths != null) {
        proxyOptions.validPaths = argv.validPaths.split(',');
    }
    if (argv.maxRows != null) {
        proxyOptions.maxRows = +argv.maxRows;
    }
    if (argv.maxStart != null) {
        proxyOptions.maxStart = +argv.maxStart;
    }
    return proxyOptions;
};
export default async function (argv, stdout, proxy) {
    const usageMessage = 'Usage: solr-proxy [options]\n' +
        '\n' +
        'Options:\n' +
        '--host          Listen on this host         [default: "localhost"]\n' +
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
        '--help, -h      Show this message';
    if (argv.help != null || argv.h != null) {
        stdout(usageMessage);
        return;
    }
    if (argv.version != null || argv.v != null) {
        const version = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')).version;
        stdout(version);
        return;
    }
    if (argv.quiet != null || argv.q != null) {
        // quiet mode, change stdout to a no-op
        stdout = function () { };
    }
    const proxyOptions = createProxyOptions(argv);
    await proxy.start(argv.port, proxyOptions);
    stdout('solr-proxy is running...');
}
