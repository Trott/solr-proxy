var Code = require('code'); 

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;

var argv = require('../../../lib/cli/argv');

describe('argv', function () {
	describe('help', function () {
		var checkForUsage = function(txt) {
			expect(txt.indexOf('Usage:')).to.equal(0);
		};

		it('should print help message with --help', function (done) {
			argv({_: [], help: true}, checkForUsage);
			done();
		});

		it('should print help message with -h', function (done) {
			argv({_: [], h: true}, checkForUsage);
			done();
		});
	});

	describe('version', function () {
		var checkForVersion = function (txt) {
			expect(txt.search(/^\d+\.\d+\.\d+/)).to.equal(0);
		};

		it('should print the version with --version', function (done) {
			argv({_: [], version: true}, checkForVersion);
			done();
		});

		it('should print the version with -v', function (done) {
			argv({_: [], v: true}, checkForVersion);
			done();
		});
	});
		
	describe('proxy', function () {
		var noop = function () {};

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
});
