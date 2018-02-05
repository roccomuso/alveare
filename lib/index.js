const colors = require('colors')
const moment = require('moment')
const {logo, welcomeText} = require('../other/text')
const NetcatServer = require('netcat/server')
const HiveInterface = require('./hive')
const {broadcast} = require('./utilities')

const welcomeMsg = `${logo}\n${welcomeText}`.yellow

function start ({BEE_HOST, BEE_PORT, QUEEN_HOST, QUEEN_PORT}) {
  console.log(logo.yellow, `\nAlveare started on port ${QUEEN_PORT}, waiting for bees on port ${BEE_PORT}`.cyan)

  // BEE HIVE
  let hive = new NetcatServer()
  hive.k().address(BEE_HOST).port(BEE_PORT).listen().on('connection', (bee) => {
    let now = moment().format('MMM Do YYYY, HH:mm:ss')
    let msg = `[${now}] New bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id})`.yellow + ' connected'.green
    console.log(msg)
    broadcast(queenLoft.getClients(), msg)
  }).on('clientClose', (bee) => {
    let now = moment().format('MMM Do YYYY, HH:mm:ss')
    let msg = `[${now}] Bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id})`.yellow + ' died'.red
    console.log(msg)
    broadcast(queenLoft.getClients(), msg)
  })

  // QUEEN BEE
  let queenLoft = new NetcatServer()
  queenLoft.k().address(QUEEN_HOST).port(QUEEN_PORT).listen().on('connection', (queenBee) => { // admin socket
    let now = moment().format('MMM Do YYYY, HH:mm:ss')
    console.log(`[${now}] A queen bee just entered the Hive`.yellow)
    let cli = new HiveInterface({welcomeMsg, hive, socket: queenBee})
    cli.start()
  }).on('clientClose', (queenBee) => {
    let now = moment().format('MMM Do YYYY, HH:mm:ss')
    console.log(`[${now}] A queen bee`, 'quit'.red)
  })
}

module.exports = start
