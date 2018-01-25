const colors = require('colors')
const {logo, welcomeText} = require('./other/text')
const NetcatServer = require('netcat/server')
const readline = require('readline')
const CliInterface = require('./lib/interface')

const QUEENBEE_PORT = process.env.QUEENBEE_PORT || 8888
const BEES_PORT = process.env.BEES_PORT || 2389
const HOST = '127.0.0.1' // only localhost interface

const welcomeMsg = `${logo}\n${welcomeText}`.yellow

console.log(logo.yellow, `\nAlveare started on port ${QUEENBEE_PORT}, waiting for bees on port ${BEES_PORT}`.cyan)

// QUEEN BEE
let nc = new NetcatServer()
nc.k().address(HOST).port(QUEENBEE_PORT).listen().on('connection', (queenBeeSocket) => {
  let cli = new CliInterface({welcomeMsg, stdin: queenBeeSocket, stdout: queenBeeSocket})
  cli.start()
})

// HIVE
let hive = new NetcatServer()
hive.k().port(BEES_PORT).listen().on('connection', (bee) => {

})

// hive.getClients()
