const readline = require('readline')
const colors = require('colors')
const moment = require('moment')
const {welcomeText} = require('../other/text')
const {getBeesList} = require('./utilities')

const _commands = {
  '.help': 'display this message',
  '.list': 'list connected bees',
  '.bind <beeID>': 'bind to a bee and connect to his established socket',
  '.unbind': 'detach the connection from the selected worker bee',
  '.credit': 'display info on the project',
  '.quit': 'close your connection',
  '.exit': 'tear down the whole beehive'
}


function defaultCompleter (line) {
  let completions = Object.keys(this.commands)
  let hits = completions.filter(function(c) {
    if (c.indexOf(line) == 0) {
      return c
    }
  })
  return [hits && hits.length ? hits : completions, line]
}

class HiveInterface {

  constructor({commands, welcomeMsg, completer, socket, hive, testing, marker} = {}) {
    this.commands = commands || _commands
    this.welcomeMsg = welcomeMsg || welcomeText
    this.completer = completer || defaultCompleter.bind(this)
    this.testing = testing ? true : false
    if (!this.testing && !socket) throw Error('Socket is required!')
    if (!hive) throw Error('Please provide a Hive instance!')
    this.socket = socket
    this.hive = hive
    this.rl = this.testing ? readline.createInterface(process.stdin, process.stdout, this.completer) : readline.createInterface(this.socket, this.socket, this.completer)
    marker = marker || '> '
    this.rl.setPrompt(marker.grey, marker.length)
  }

  getHelp () {
    let msg = []
    for (let i in this.commands) {
      msg.push(`${i}\t\t${this.commands[i]}`)
    }
    return msg.join('\n').grey
  }

  welcome () {
    this.response(this.welcomeMsg.yellow)
    this.rl.prompt()
  }

  response (out) {
    // HACK: process.stdout.write needs to be bound to the process.stdout object
    let write = this.testing ? process.stdout.write.bind(process.stdout) : this.socket.write
    write(`${out}\n`)
  }

  exec (command) {
    if (command[0] === '.') {
      switch (command.slice(1).split(' ')[0]) {
        case 'help':
          this.response(this.getHelp())
          break
        case 'list':
          let bees = getBeesList(this.hive.getClients())
          bees = bees.length ? bees.join('\n').green : 'No bees connected'.grey
          this.response(bees)
          break
        case 'bind':
          let beeID = command.slice(1).split(' ')[1]
          if (!beeID) return this.response(`Please provide a Bee ID`.red)
          let targetSocket = this.hive.getClients()[beeID]
          if (!targetSocket) return this.response(`Cannot find bee with ID ${beeID}`.red)
          this.response(`Binding to ${beeID} on ${targetSocket.remoteAddress}:${targetSocket.remotePort}`.yellow)
          // connecting sockets
          if (this.sendTo) this.sendTo.removeAllListeners()
          this.sendTo = targetSocket
          this.sendTo.on('data', (chunk) => {
            console.log('evento on Data')
            this.socket.write(chunk.toString()) // in data
          })
          this.sendTo.on('close', () => { // close o end??
            console.log('EVENTO: close') // TODO: do not removeAllListeners() will corrupt netcat too
            this.sendTo.removeAllListeners()
            this.sendTo = null
          })
          this.sendTo.on('end', () => {
            console.log('evento .end')
            this.sendTo.removeAllListeners()
            delete this.hive._clients[this.sendTo.id] // HACK
            this.sendTo = null
          })
          let now = moment().format('MMM Do YYYY, HH:mm:ss')
          console.log(`[${now}] Queen Bee bound to the bee: ${beeID}`.yellow)
          break
        case 'unbind':
          if (this.sendTo) this.sendTo.removeAllListeners()
          this.sendTo = null
          break
        case 'credit':
          this.response(`Rocco Musolino (@roccomuso) - github.com/roccomuso/alveare`.green)
          break
        case 'quit':
        case 'q':
          this.response(`Bye!`.green)
          if (!this.testing) this.socket.destroy() // NB. socket method
          break
        case 'exit':
          this.response(`Tearing down the beehive...!`.red)
          process.exit(0)
          break
      }
    } else {
      // only print if they typed something and if not bound to a bee
      if (command !== '' && !this.sendTo) {
        this.response(`"${command}" is not a valid command, sorry`.yellow)
      } else if (this.sendTo) {
        this.sendTo.write(`${command}\n`) // send command to the worker
      }
    }
    this.rl.prompt()
  }

  start () {
    this.rl.on('line', (cmd) => {
      this.exec(cmd.trim())
    }).on('close', () => {
      // only gets triggered by ^C or ^D
      console.log('readline close event')
      //this.response('goodbye!'.green)
      //process.exit(0)
    })

    this.welcome()
  }


}

module.exports = HiveInterface


if (!module.parent) {

  let hive = new NetcatServer()
  hive.k().port(BEES_PORT).listen().on('connection', (bee) => {
    console.log(`New bee ${bee.id} connected`.yellow)
  })

  let cli = new HiveInterface({testing: true, hive})
  cli.start()

}
