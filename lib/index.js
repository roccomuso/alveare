const colors = require('colors') // eslint-disable-line no-unused-vars
const moment = require('moment')
const {logo, welcomeText} = require('../other/text')
const NetcatServer = require('netcat/server')
const HiveInterface = require('./hive')
const {broadcast} = require('./utilities')
const fs = require('fs');
const readline = require('readline');

const welcomeMsg = `${logo}\n${welcomeText}`.yellow

function start ({BEE_HOST, BEE_PORT, QUEEN_HOST, QUEEN_PORT, HONEY_SCRIPT}) {
  console.log(logo.yellow, `\nAlveare started on port ${QUEEN_PORT}, waiting for bees on port ${BEE_PORT}`.cyan)

  // abort if HONEY_SCRIPT not exists if set
  if (HONEY_SCRIPT != '') {
    if (!fs.existsSync(HONEY_SCRIPT)) {
        console.log(`Alveare can't find your HONEY_SCRIPT at ${HONEY_SCRIPT}`);
        process.exit(1);
    }
  }
  
  // BEE HIVE
  let hive = new NetcatServer()
  hive.k().address(BEE_HOST).port(BEE_PORT).listen().on('connection', (bee) => {
    let now = moment().format('MMM Do YYYY, HH:mm:ss')
    let msg = `[${now}] New bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id})`.yellow + ' connected'.green
    console.log(msg)
    broadcast(queenLoft.getClients(), msg);
    
  // send "HONEY_SCRIPT" line by line to client on new connection  
  }).on('connection', (bee) => {
    const rl = readline.createInterface({
        input: fs.createReadStream(HONEY_SCRIPT),
        crlfDelay: Infinity
    });
    rl.on('line', (line) => {
        bee.write(`${line}\n`);
    });      
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

module.exports = {
  start
}
