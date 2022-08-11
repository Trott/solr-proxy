import assert from 'node:assert';
import { beforeEach, describe, it } from 'mocha';
import argv from '../../../lib/cli/argv.js';
const noop = function () { };
const noopProxy = { start: noop };
describe('argv', function () {
    describe('help', function () {
        const checkForUsage = function (txt) {
            assert.strictEqual(txt.indexOf('Usage:'), 0);
        };
        it('should print help message with --help', async function () {
            await argv({ _: [], help: true }, checkForUsage, noopProxy);
        });
        it('should print help message with -h', async function () {
            await argv({ _: [], h: true }, checkForUsage, noopProxy);
        });
        it('should print a usage message with lines of 80 chars or less', async function () {
            await argv({ _: [], h: true }, function (txt) {
                const lines = txt.split('\n');
                lines.forEach(function (value) {
                    assert.ok(value.length < 81);
                });
            }, noopProxy);
        });
    });
    describe('version', function () {
        const checkForVersion = function (txt) {
            assert.strictEqual(txt.search(/^\d+\.\d+\.\d+/), 0);
        };
        it('should print the version with --version', async function () {
            await argv({ _: [], version: true }, checkForVersion, noopProxy);
        });
        it('should print the version with -v', async function () {
            await argv({ _: [], v: true }, checkForVersion, noopProxy);
        });
    });
    describe('quiet', function () {
        let stdoutWriteCount;
        beforeEach(function () {
            stdoutWriteCount = 0;
        });
        const stdoutTestDouble = function () {
            stdoutWriteCount += 1;
        };
        it('should not print anything to stdout with --quiet', async function () {
            await argv({ _: [], quiet: true }, stdoutTestDouble, noopProxy);
            assert.strictEqual(stdoutWriteCount, 0);
        });
        it('should not print anything to stdout with -q', async function () {
            await argv({ _: [], q: true }, stdoutTestDouble, noopProxy);
            assert.strictEqual(stdoutWriteCount, 0);
        });
        it('should print to stdout if no --quiet or -q', async function () {
            await argv({ _: [] }, stdoutTestDouble, noopProxy);
            assert.ok(stdoutWriteCount > 0);
        });
    });
    describe('proxy', function () {
        it('should start with defaults if no options specified', async function () {
            const proxyTestDouble = {
                start: function (port, options) {
                    assert.strictEqual(port, undefined);
                    assert.deepStrictEqual(options, {});
                }
            };
            await argv({ _: [] }, noop, proxyTestDouble);
        });
        it('should start with options if specified', async function () {
            const proxyTestDouble = {
                start: function (port, options) {
                    assert.strictEqual(port, '9999');
                    assert.deepStrictEqual(options, {
                        host: '127.0.0.1',
                        upstream: 'https://example.com:8888',
                        validHttpMethods: ['DELETE', 'PUT'],
                        invalidParams: ['q'],
                        validPaths: ['/come/on', '/fhqwhagads'],
                        maxRows: 100,
                        maxStart: 1000
                    });
                }
            };
            const argvStuff = {
                _: [],
                host: '127.0.0.1',
                port: '9999',
                upstream: 'https://example.com:8888',
                validMethods: 'DELETE,PUT',
                invalidParams: 'q',
                validPaths: '/come/on,/fhqwhagads',
                maxRows: 100,
                maxStart: 1000
            };
            await argv(argvStuff, noop, proxyTestDouble);
        });
    });
});
