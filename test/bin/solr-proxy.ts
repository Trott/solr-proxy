import assert from 'node:assert'
import childProcess from 'child_process'

import { describe, it } from 'mocha'

describe('CLI', function () {
  it('should run', async function () {
    return await new Promise<void>(function (resolve, reject) {
      let output = ''
      const subprocess = childProcess.spawn('bin/solr-proxy.js', [])
      subprocess.stdout.once('data', function (data) {
        output += data.toString() as string
        subprocess.kill('SIGINT')
      })
      subprocess.once('exit', function (code, signal) {
        assert.strictEqual(output, 'solr-proxy is running...\n')
        assert.strictEqual(code, null)
        assert.strictEqual(signal, 'SIGINT')
        resolve()
      })
    })
  })
})
