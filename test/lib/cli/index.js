var Code = require('code')

var Lab = require('@hapi/lab')
var lab = exports.lab = Lab.script()

var expect = Code.expect
var describe = lab.experiment
var it = lab.test

var cli = require('../../../lib/cli')

describe('exports', function () {
  it('should export argv()', function (done) {
    expect(typeof cli.argv).to.equal('function')
  })
})
