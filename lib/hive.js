const readline = require('readline')
const colors = require('colors')
const {welcomeText} = require('../other/text')

const _commands = {
  '.help': 'display this message',
  '.credit': 'display info on the project',
  '.quit': 'close your connection',
  '.exit': 'shut-down the whole beehive'
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
      switch (command.slice(1)) {
        case 'help':
          this.response(this.getHelp())
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
          this.response(`Breaking down the beehive...!`.red)
          process.exit(0)
          break
      }
    } else {
      // only print if they typed something
      if (command !== '') {
        this.response(`"${command}" is not a valid command, sorry`.yellow)
      }
    }
    this.rl.prompt()
  }

  start () {
    this.rl.on('line', (cmd) => {
      this.exec(cmd.trim())
    }).on('close', () => {
      // only gets triggered by ^C or ^D
      this.response('goodbye!'.green)
      process.exit(0)
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
