import assert from 'node:assert'

import { beforeEach, describe, it } from 'mocha'

import type SolrProxy from '../../../index.js'

import argv from '../../../lib/cli/argv.js'

const noop = function (): void {}
const noopProxy = { start: noop }

describe('argv', function () {
  describe('help', function () {
    const checkForUsage = function (txt: string): void {
      assert.strictEqual(txt.indexOf('Usage:'), 0)
    }

    it('should print help message with --help', async function () {
      await argv({ _: [], help: true }, checkForUsage, noopProxy as typeof SolrProxy)
    })

    it('should print help message with -h', async function () {
      await argv({ _: [], h: true }, checkForUsage, noopProxy as typeof SolrProxy)
    })

    it('should print a usage message with lines of 80 chars or less', async function () {
      await argv({ _: [], h: true }, function (txt: string) {
        const lines = txt.split('\n')
        lines.forEach(function (value) {
          assert.ok(value.length < 81)
        })
      }, noopProxy as typeof SolrProxy)
    })
  })

  describe('version', function () {
    const checkForVersion = function (txt: string): void {
      assert.strictEqual(txt.search(/^\d+\.\d+\.\d+/), 0)
    }

    it('should print the version with --version', async function () {
      await argv({ _: [], version: true }, checkForVersion, noopProxy as typeof SolrProxy)
    })

    it('should print the version with -v', async function () {
      await argv({ _: [], v: true }, checkForVersion, noopProxy as typeof SolrProxy)
    })
  })

  describe('quiet', function () {
    let stdoutWriteCount: number

    beforeEach(function () {
      stdoutWriteCount = 0
    })

    const stdoutTestDouble = function (): void {
      stdoutWriteCount += 1
    }

    it('should not print anything to stdout with --quiet', async function () {
      await argv({ _: [], quiet: true }, stdoutTestDouble, noopProxy as typeof SolrProxy)
      assert.strictEqual(stdoutWriteCount, 0)
    })

    it('should not print anything to stdout with -q', async function () {
      await argv({ _: [], q: true }, stdoutTestDouble, noopProxy as typeof SolrProxy)
      assert.strictEqual(stdoutWriteCount, 0)
    })

    it('should print to stdout if no --quiet or -q', async function () {
      await argv({ _: [] }, stdoutTestDouble, noopProxy as typeof SolrProxy)
      assert.ok(stdoutWriteCount > 0)
    })
  })

  describe('proxy', function () {
    it('should start with defaults if no options specified', async function () {
      const proxyTestDouble = {
        start: function (port: any, options: any) {
          assert.strictEqual(port, undefined)
          assert.deepStrictEqual(options, {})
        }
      }
      await argv({ _: [] }, noop, proxyTestDouble as typeof SolrProxy)
    })

    it('should start with options if specified', async function () {
      const proxyTestDouble = {
        start: function (port: any, options: any) {
          assert.strictEqual(port, '9999')
          assert.deepStrictEqual(options, {
            upstream: 'https://example.com:8888',
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
        upstream: 'https://example.com:8888',
        validMethods: 'DELETE,PUT',
        invalidParams: 'q',
        validPaths: '/come/on,/fhqwhagads',
        maxRows: 100,
        maxStart: 1000
      }

      await argv(argvStuff, noop, proxyTestDouble as typeof SolrProxy)
    })
  })
})
