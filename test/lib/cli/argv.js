var Code = require('code'); 

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;

var argv = require('../../../lib/cli/argv');

describe('argv', function () {
	var noop = function () {};

	it('should print help message with --help', function (done) {

		var checkForUsageMessage = function(txt) {
			expect(txt.indexOf('Usage:')).to.equal(0);
			done();
		};

		argv({_: [], help: true}, checkForUsageMessage);
	});

	it('should print help message with -h', function (done) {
		var checkForUsageMessage = function(txt) {
			expect(txt.indexOf('Usage:')).to.equal(0);
			done();
		};

		argv({_: [], h: true}, checkForUsageMessage);
	});

	it('should start with defaults if no options specified', function (done) {
		var proxyTestDouble = {
			start: function (port, options) {
				expect(port).to.be.undefined();
				expect(options).to.deep.equal({backend: {}});
				done();
			}
		};
		argv({_: []}, noop, proxyTestDouble);
	});

	it('should start with options if specified', function (done) {
		var proxyTestDouble = {
			start: function (port, options) {
				expect(port).to.equal('9999');
				expect(options).to.deep.equal({
					backend: { port: '8888', host: 'example.com'},
					validHttpMethods: ['DELETE', 'PUT'],
					invalidParams: ['q'],
					validPaths: ['/come/on', '/fhqwhagads']
				});
				done();
			}
		};

		var argvStuff = {
			_: [],
			port: '9999',
			backendPort: '8888',
			backendHost: 'example.com',
			validMethods: 'DELETE,PUT',
			invalidParams: 'q',
			validPaths: '/come/on,/fhqwhagads'
		};

		argv(argvStuff, noop, proxyTestDouble);
	});
});
