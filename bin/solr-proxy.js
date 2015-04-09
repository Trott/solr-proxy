#!/usr/bin/env node

var cli = require('../lib/cli');
var argv = require('minimist')(process.argv.slice(2));
var SolrProxy = require('../');

cli.argv(argv, console.log, SolrProxy);