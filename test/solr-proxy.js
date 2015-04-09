/*jshint expr: true*/

var Code = require('code'); 

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;

var http = require('http');
var request = require('request');

var SolrProxy = require('../solr-proxy.js');

var createSolrTestDouble = function (responseCode) {
    var server = http.createServer(function(req, res) {
        res.writeHead(responseCode);
        res.end();
    });
    return server.listen(8080);
};

describe('exports', function () {
    it('should expose a start function', function (done) {
        expect(typeof SolrProxy.start).to.equal('function');
        done();
    });
});

describe('start()', function () {
    var proxy;
    var solrTestDouble;

    beforeEach(function (done) {
        solrTestDouble = createSolrTestDouble(200);
        done();
    });

    afterEach(function (done) {
        proxy.close();
        solrTestDouble.close();
        done();
    });

    it('should start a proxy on specified port if port is specified', function (done) {
        proxy = SolrProxy.start(9999);

        request
        .get('http://localhost:9999/solr/select?q=fhqwhagads')
        .on('response', function (response) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should not start a proxy on the default port if a different port is specified', function (done) {
        proxy = SolrProxy.start(9999);

        request
        .get('http://localhost:8008/solr/select?q=fhqwhagads')
        .on('error', function (err) {
            expect(err.code).to.equal('ECONNREFUSED');
            done();
        });
    });

    it('should use options if specified', function (done) {
        proxy = SolrProxy.start(null, {validPaths: '/come/on'});

        request
        .get('http://localhost:8008/come/on?q=fhqwhagads')
        .on('response', function (response) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});

describe('proxy server', function () {
    var proxy;
    var solrTestDouble;

    beforeEach(function (done) {
        proxy = SolrProxy.start();
        done();
    });

    afterEach(function (done) {
        proxy.close();
        if (solrTestDouble.close) {
            solrTestDouble.close();
        }
        done();
    });

    it('should return 502 on proxy error', function (done) {
        solrTestDouble = createSolrTestDouble('abc');

        request
        .get('http://localhost:8008/solr/select?q=fhqwhagads')
        .on('response', function (response) {
            expect(response.statusCode).to.equal(502);
            done();
        });
    });

    it('should return 200 for a valid request', function (done) {
        solrTestDouble = createSolrTestDouble(200);

        request
        .get('http://localhost:8008/solr/select?q=fhqwhagads')
        .on('response', function (response) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should return 403 on POST requests', function (done) {
        solrTestDouble = createSolrTestDouble(200);

        request
        .post('http://localhost:8008/solr/select?q=fhqwhagads')
        .on('response', function (response) {
            expect(response.statusCode).to.equal(403);
            done();
        });
    });

    it('should return 403 on requests for /solr/admin', function (done) {
        solrTestDouble = createSolrTestDouble(200);

        request
        .get('http://localhost:8008/solr/admin')
        .on('response', function (response) {
            expect(response.statusCode).to.equal(403);
            done();
        });
    });

    it('should return 403 on request with qt parameter', function (done) {
        solrTestDouble = createSolrTestDouble(200);

        request
        .get('http://localhost:8008/solr/select?q=fhqwhagads&qt=%2Fupdate')
        .on('response', function (response) {
            expect(response.statusCode).to.equal(403);
            done();
        });
    });

    it('should return 403 on request with stream.url parameter', function (done) {
        solrTestDouble = createSolrTestDouble(200);

        request
        .get('http://localhost:8008/solr/select?q=fhqwhagads&stream.url=EVERYBODYTOTHELIMIT!')
        .on('response', function (response) {
            expect(response.statusCode).to.equal(403);
            done();
        });
    });
});