var Code = require('code'); 

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;

var beforeEach = lab.beforeEach;

var argv = require('../../../lib/cli/argv');

var noop = function () {};

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

		it('should print a usage message with lines of 80 chars or less', function (done) {
			argv({_: [], h: true}, function (txt) {
				var lines = txt.split('\n');
				lines.forEach(function (value) {
					expect(value.length).to.be.below(81);
				});
				done();
			});
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

	describe('quiet', function () {
		var noopProxy = { start: noop };

		var stdoutWriteCount;

		beforeEach(function (done) {
			stdoutWriteCount = 0;
			done();
		});

		var stdoutTestDouble = function () {
			stdoutWriteCount += 1;
		};

		it('should not print anything to stdout with --quiet', function (done) {
			argv({_: [], quiet: true}, stdoutTestDouble, noopProxy);
			expect(stdoutWriteCount).to.equal(0);
			done();
		});

		it('should not print anything to stdout with -q', function (done) {
			argv({_: [], q: true}, stdoutTestDouble, noopProxy);
			expect(stdoutWriteCount).to.equal(0);
			done();
		});

		it('should print to stdout if no --quiet or -q', function (done) {
			argv({_: []}, stdoutTestDouble, noopProxy);
			expect(stdoutWriteCount).to.be.greaterThan(0);
			done();
		});
	});
		
	describe('proxy', function () {
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
