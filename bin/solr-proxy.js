#!/usr/bin/env node
import argv from '../lib/cli/argv.js';
import minimist from 'minimist';
import SolrProxy from '../index.js';
const args = minimist(process.argv.slice(2));
await argv(args, console.log, SolrProxy);
