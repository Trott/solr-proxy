const Code = require('@hapi/code')

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()

const expect = Code.expect
const describe = lab.experiment
const it = lab.test

const cli = require('../../../lib/cli')

describe('exports', function () {
  it('should export argv()', function (done) {
    expect(typeof cli.argv).to.equal('function')
  })
})
