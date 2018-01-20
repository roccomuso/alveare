const readline = require('readline')
const colors = require('colors')

const _commands = {
  '.help': 'display this message',
  '.credit': 'display info on the project',
  '.quit': 'exit console'
}

const welcomeMessage = `
  Welcome to your hive queen bee.
  Enter .help if you're lost. Enjoy!
`

function defaultCompleter (line) {
  let completions = Object.keys(this.commands)
  let hits = completions.filter(function(c) {
    if (c.indexOf(line) == 0) {
      return c
    }
  })
  return [hits && hits.length ? hits : completions, line]
}

class CliInterface {

  constructor({commands, completer, stdin, stdout, marker} = {}) {
    this.commands = commands || _commands
    this.completer = completer || defaultCompleter.bind(this)
    this.stdin = stdin || process.stdin
    this.stdout = stdout || process.stdout
    this.isSocket = stdout ? true : false
    this.rl = readline.createInterface(this.stdin, this.stdout, this.completer)
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
    this.response(welcomeMessage.yellow)
    this.rl.prompt()
  }

  response (out) {
    // HACK: process.stdout.write needs to be bound to the process.stdout object
    let write = this.isSocket ? this.stdout.write : this.stdout.write.bind(process.stdout)
    write(`${out}\n`)
  }

  exec (command) {
    if (command[0] === '.') {
      switch (command.slice(1)) {
        case 'help':
          this.response(this.getHelp())
          break
        case 'credit':
          this.response(`Rocco Musolino (@roccomuso) - github.com/roccomuso/alveare`.grey)
          break
        case 'quit':
        case 'q':
          process.exit(0)
          break
      }
    } else {
      // only print if they typed something
      if (command !== '') {
        this.response(`"${command}" is not a valid command dude, sorry`.yellow)
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

module.exports = CliInterface


if (!module.parent) {

  let cli = new CliInterface()
  cli.start()

}
