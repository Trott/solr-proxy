const Code = require('@hapi/code')

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()

const expect = Code.expect
const describe = lab.experiment
const it = lab.test

const beforeEach = lab.beforeEach

const argv = require('../../../lib/cli/argv')

const noop = function () {}

describe('argv', function () {
  describe('help', function () {
    const checkForUsage = function (txt) {
      expect(txt.indexOf('Usage:')).to.equal(0)
    }

    it('should print help message with --help', function () {
      argv({ _: [], help: true }, checkForUsage)
    })

    it('should print help message with -h', function () {
      argv({ _: [], h: true }, checkForUsage)
    })

    it('should print a usage message with lines of 80 chars or less', function () {
      argv({ _: [], h: true }, function (txt) {
        const lines = txt.split('\n')
        lines.forEach(function (value) {
          expect(value.length).to.be.below(81)
        })
      })
    })
  })

  describe('version', function () {
    const checkForVersion = function (txt) {
      expect(txt.search(/^\d+\.\d+\.\d+/)).to.equal(0)
    }

    it('should print the version with --version', function () {
      argv({ _: [], version: true }, checkForVersion)
    })

    it('should print the version with -v', function () {
      argv({ _: [], v: true }, checkForVersion)
    })
  })

  describe('quiet', function () {
    const noopProxy = { start: noop }

    let stdoutWriteCount

    beforeEach(function () {
      stdoutWriteCount = 0
    })

    const stdoutTestDouble = function () {
      stdoutWriteCount += 1
    }

    it('should not print anything to stdout with --quiet', function () {
      argv({ _: [], quiet: true }, stdoutTestDouble, noopProxy)
      expect(stdoutWriteCount).to.equal(0)
    })

    it('should not print anything to stdout with -q', function () {
      argv({ _: [], q: true }, stdoutTestDouble, noopProxy)
      expect(stdoutWriteCount).to.equal(0)
    })

    it('should print to stdout if no --quiet or -q', function () {
      argv({ _: [] }, stdoutTestDouble, noopProxy)
      expect(stdoutWriteCount).to.be.greaterThan(0)
    })
  })

  describe('proxy', function () {
    it('should start with defaults if no options specified', function () {
      const proxyTestDouble = {
        start: function (port, options) {
          expect(port).to.be.undefined()
          expect(options).to.equal({ backend: {} })
        }
      }
      argv({ _: [] }, noop, proxyTestDouble)
    })

    it('should start with options if specified', function () {
      const proxyTestDouble = {
        start: function (port, options) {
          expect(port).to.equal('9999')
          expect(options).to.equal({
            backend: { port: '8888', host: 'example.com' },
            validHttpMethods: ['DELETE', 'PUT'],
            invalidParams: ['q'],
            validPaths: ['/come/on', '/fhqwhagads'],
            maxRows: 100,
            maxStart: 1000
          })
        }
      }

      const argvStuff = {
        _: [],
        port: '9999',
        backendPort: '8888',
        backendHost: 'example.com',
        validMethods: 'DELETE,PUT',
        invalidParams: 'q',
        validPaths: '/come/on,/fhqwhagads',
        maxRows: 100,
        maxStart: 1000
      }

      argv(argvStuff, noop, proxyTestDouble)
    })
  })
})
