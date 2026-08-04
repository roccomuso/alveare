import readline from 'readline'
import chalk from 'chalk'
import moment from 'moment'
import { welcomeText } from '../other/text.js'
import { getIndexedBeesList, getBeeByIndex } from './utilities.js'

const _commands = {
  '.help': 'display this message',
  '.list': 'list connected bees',
  '.bind <n>': 'bind to a bee and connect to his established socket',
  '.unbind': 'detach the connection from the selected worker bee',
  '.uptime': 'show hive uptime',
  '.credit': 'display info on the project',
  '.quit': 'close your connection',
  '.exit': 'tear down the whole beehive'
}

function defaultCompleter (line) {
  const completions = Object.keys(this.commands)
  const hits = completions.filter(function (c) {
    if (c.indexOf(line) === 0) {
      return c
    }
  })
  return [hits && hits.length ? hits : completions, line]
}

export class HiveInterface {
  constructor ({ commands, welcomeMsg, completer, socket, hive, testing, marker } = {}) {
    this.commands = commands || _commands
    this.welcomeMsg = welcomeMsg || welcomeText
    this.completer = completer || defaultCompleter.bind(this)
    this.testing = !!testing
    if (!this.testing && !socket) throw Error('Socket is required!')
    if (!hive) throw Error('Please provide a Hive instance!')
    this.socket = socket
    this.hive = hive
    this.rl = this.testing
      ? readline.createInterface({ input: process.stdin, output: process.stdout, completer: this.completer })
      : readline.createInterface({ input: this.socket, output: this.socket, completer: this.completer })
    this.marker = marker || '> '
    this.rl.setPrompt(chalk.grey(this.marker))
    this.socket.on('close', () => {
      // queen bee closed
      this.removeSendToListeners()
      this.sendTo = null
    })
  }

  getHelp () {
    const msg = []
    for (const i in this.commands) {
      msg.push(`${i}\t\t${this.commands[i]}`)
    }
    return chalk.grey(msg.join('\n'))
  }

  welcome () {
    this.response(chalk.yellow(this.welcomeMsg))
    this.rl.prompt()
  }

  response (out) {
    // write must stay bound to its owning stream, otherwise `this` is lost inside it
    const write = this.testing ? process.stdout.write.bind(process.stdout) : this.socket.write.bind(this.socket)
    write(`${out}\n`)
  }

  onData () {
    if (this._onData) return this._onData
    this._onData = function (chunk) {
      this.socket.write(chunk.toString()) // in data
    }
    this._onData = this._onData.bind(this)
    return this._onData
  }

  removeSendToListeners () {
    if (this.sendTo) {
      this.sendTo.removeListener('data', this.onData())
      this.sendTo.removeListener('close', this.onClose())
      this.sendTo.removeListener('end', this.onClose())
    }
  }

  onClose () {
    if (this._onClose) return this._onClose
    this._onClose = function () {
      if (!this.sendTo) return
      this.removeSendToListeners()
      this.rl.setPrompt(chalk.grey(this.marker)) // reset marker
      this.socket.write(chalk.red(`[connection closed with ${this.sendTo.id}]\n`))
      this.sendTo = null
      this.rl.prompt()
    }
    this._onClose = this._onClose.bind(this)
    return this._onClose
  }

  exec (command) {
    if (command[0] === '.') {
      switch (command.slice(1).split(' ')[0]) {
        case 'help':
          this.response(this.getHelp())
          break
        case 'list': {
          const bees = getIndexedBeesList(this.hive.getClients())
          this.response(bees.length ? chalk.green(bees.join('\n')) : chalk.grey('No bees connected'))
          break
        }
        case 'bind': {
          const index = command.slice(1).split(' ')[1]
          if (!index) return this.response(chalk.red('Please provide a Bee ID'))
          const targetSocket = getBeeByIndex(this.hive.getClients(), index)
          if (!targetSocket) return this.response(chalk.red(`Cannot find bee with Index ${index}`))
          if (this.sendTo) return this.response(chalk.red('Please first .unbind the current connection'))
          this.response(chalk.yellow(`Binding to ${index} on ${targetSocket.remoteAddress}:${targetSocket.remotePort}`))
          // connecting sockets
          this.sendTo = targetSocket
          this.sendTo.on('data', this.onData())
          this.sendTo.on('close', this.onClose())
          const newMarker = chalk.grey(`${targetSocket.id} > `)
          this.rl.setPrompt(newMarker)
          break
        }
        case 'unbind':
          if (this.sendTo) {
            this.removeSendToListeners()
            this.sendTo = null
            this.rl.setPrompt(chalk.grey(this.marker)) // reset marker
          }
          break
        case 'uptime':
          this.response(chalk.green(moment.duration(process.uptime(), 'seconds').humanize()))
          break
        case 'credit':
          this.response(chalk.green('Rocco Musolino (@roccomuso) - github.com/roccomuso/alveare'))
          break
        case 'quit':
        case 'q':
          this.response(chalk.green('Bye!'))
          if (!this.testing) this.socket.destroy() // NB. socket method
          break
        case 'exit':
          this.response(chalk.red('Tearing down the beehive...!'))
          process.exit(0)
          break // eslint-disable-line no-unreachable
      }
    } else {
      // only print if they typed something and if not bound to a bee
      if (command !== '' && !this.sendTo) {
        this.response(chalk.yellow(`"${command}" is not a valid command, sorry`))
      } else if (this.sendTo) {
        this.sendTo.write(`${command}\n`) // send command to the worker
      }
    }
    this.rl.prompt() // if bee queen socket still opened prompt for next cmd
  }

  start () {
    this.rl.on('line', (cmd) => {
      this.exec(cmd.trim())
    })

    this.welcome()
  }
}
