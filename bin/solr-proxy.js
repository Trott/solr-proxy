#!/usr/bin/env node

const cli = require('../lib/cli')
const argv = require('minimist')(process.argv.slice(2))
const SolrProxy = require('..')

async function run () {
  await cli.argv(argv, console.log, SolrProxy)
}

run()
