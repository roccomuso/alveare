#!/usr/bin/env node
const args = require('args')
const { start } = require('./lib/index')

args
  .option(['h', 'queen-host'], 'Queen bees host to bind the listening server to', '127.0.0.1')
  .option(['p', 'queen-port'], 'The port on which the hive will be listening for queen bees', 8869)
  .option(['H', 'bee-host'], 'Worker bees host to bind the listening server to', '0.0.0.0')
  .option(['P', 'bee-port'], 'The port on which the hive will be listening for worker bees', 2389)

const flags = args.parse(process.argv)

start({
  QUEEN_HOST: flags.queenHost,
  QUEEN_PORT: flags.queenPort,
  BEE_HOST: flags.beeHost,
  BEE_PORT: flags.beePort
})
