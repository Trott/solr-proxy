import Code from '@hapi/code'
import Lab from '@hapi/lab'
import childProcess from 'child_process'

const lab = Lab.script()
export { lab }

const expect = Code.expect
const describe = lab.experiment
const it = lab.test

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
        expect(output).to.equal('solr-proxy is running...\n')
        expect(code).to.equal(null)
        expect(signal).to.equal('SIGINT')
        resolve()
      })
    })
  })
})
