const colors = require('colors')
const {logo, welcomeText} = require('./other/text')
const NetcatServer = require('netcat/server')
const readline = require('readline')
const HiveInterface = require('./lib/hive')

const QUEENBEE_PORT = process.env.QUEENBEE_PORT || 8888
const BEES_PORT = process.env.BEES_PORT || 2389
const HOST = '127.0.0.1' // only localhost interface

const welcomeMsg = `${logo}\n${welcomeText}`.yellow

console.log(logo.yellow, `\nAlveare started on port ${QUEENBEE_PORT}, waiting for bees on port ${BEES_PORT}`.cyan)

// BEE HIVE
let hive = new NetcatServer()
hive.k().port(BEES_PORT).listen().on('connection', (bee) => {
  console.log(`New bee ${bee.id} connected`.yellow)
})

// hive.getClients()

// QUEEN BEE
let nc = new NetcatServer()
nc.k().address(HOST).port(QUEENBEE_PORT).listen().on('connection', (queenBee) => { // admin socket
  let cli = new HiveInterface({welcomeMsg, socket: queenBee})
  cli.start()
})
