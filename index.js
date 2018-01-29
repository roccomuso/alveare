const colors = require('colors')
const moment = require('moment')
const {logo, welcomeText} = require('./other/text')
const NetcatServer = require('netcat/server')
const HiveInterface = require('./lib/hive')

const QUEENBEE_PORT = process.env.QUEENBEE_PORT || 8888
const BEES_PORT = process.env.BEES_PORT || 2389
const HOST = '127.0.0.1' // only localhost interface

const welcomeMsg = `${logo}\n${welcomeText}`.yellow

console.log(logo.yellow, `\nAlveare started on port ${QUEENBEE_PORT}, waiting for bees on port ${BEES_PORT}`.cyan)

// BEE HIVE
let hive = new NetcatServer()
hive.k().port(BEES_PORT).listen().on('connection', (bee) => {
  let now = moment().format('MMM Do YYYY, HH:mm:ss')
  console.log(`[${now}] New bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id})`.yellow, 'connected'.green)
}).on('clientClose', (bee) => {
  let now = moment().format('MMM Do YYYY, HH:mm:ss')
  console.log(`[${now}] Bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id})`.yellow, 'died'.red)
})

// QUEEN BEE
let nc = new NetcatServer()
nc.k().address(HOST).port(QUEENBEE_PORT).listen().on('connection', (queenBee) => { // admin socket
  let now = moment().format('MMM Do YYYY, HH:mm:ss')
  console.log(`[${now}] A queen bee just entered the Hive`.yellow)
  let cli = new HiveInterface({welcomeMsg, hive, socket: queenBee})
  cli.start()
})
