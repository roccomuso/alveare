import chalk from 'chalk'
import NetcatServer from 'netcat/server.js'
import { logo, welcomeText } from '../other/text.js'
import { HiveInterface } from './hive.js'
import { broadcast } from './utilities.js'
import { mountDashboard } from './dashboard.js'
import { logger } from './logger.js'

const welcomeMsg = chalk.yellow(`${logo}\n${welcomeText}`)

export function start ({ BEE_HOST, BEE_PORT, QUEEN_HOST, QUEEN_PORT }) {
  // QUEEN BEE
  const queenLoft = new NetcatServer()

  // BEE HIVE
  const hive = new NetcatServer()
  hive.k().address(BEE_HOST).port(BEE_PORT).listen().on('connection', (bee) => {
    const now = new Date().toISOString()
    const msg = chalk.yellow(`[${now}] New bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id})`) + chalk.green(' connected')
    broadcast(queenLoft.getClients(), msg)
  }).on('clientClose', (bee) => {
    const now = new Date().toISOString()
    const msg = chalk.yellow(`[${now}] Bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id})`) + chalk.red(' died')
    broadcast(queenLoft.getClients(), msg)
  }).on('error', (err) => {
    logger.fatal(`Bee hive listener error: ${err.message}`)
    process.exit(1)
  })

  queenLoft.k().address(QUEEN_HOST).port(QUEEN_PORT).listen().on('connection', (queenBee) => { // admin socket
    const cli = new HiveInterface({ welcomeMsg, hive, socket: queenBee })
    cli.start()
  }).on('error', (err) => {
    logger.fatal(`Queen loft listener error: ${err.message}`)
    process.exit(1)
  })

  mountDashboard({
    logo,
    welcomeMsg,
    queenHost: QUEEN_HOST,
    queenPort: QUEEN_PORT,
    beeHost: BEE_HOST,
    beePort: BEE_PORT,
    hive,
    queen: queenLoft
  })
}
