# :honeybee: alveare

[![NPM Version](https://img.shields.io/npm/v/alveare.svg)](https://www.npmjs.com/package/alveare)
![node](https://img.shields.io/node/v/alveare.svg)
[![Dependency Status](https://david-dm.org/roccomuso/alveare.png)](https://david-dm.org/roccomuso/alveare)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Multi-client, multi-threaded reverse shell handler written in Node.js :honey_pot:

Alveare (`hive` in italian) lets you listen for incoming reverse connection, list them, handle and bind the sockets. It's an easy to use tool, useful to handle reverse shells and remote processes.


## Install

> npm install -g alveare

### How it works

Alveare is a **tcp server with 2 listening ports**. One used by the *queen bees* and the other by *worker bees*.

1. Default usage, type: `alveare`
2. Connect to it as a queen bee: `telnet localhost 8869` and type `.help`
3. Wait for worker bees to join the hive...

You can spawn a [netcat reverse-shell](https://github.com/roccomuso/netcat#reverse-shell) and increase the number of incoming connections (bees).

### Usage

![Alveare](/other/screen.png?raw=true "Alveare")

See **alveare** usage: `alveare --help`.

```text
Usage: alveare [options] [command]

Commands:

  help  Display help

Options:

  -H, --bee-host [value]    Worker bees host to bind the listening server to (defaults to "0.0.0.0")
  -P, --bee-port <n>        The port on which the hive will be listening for worker bees (defaults to 2389)
  -H, --help                Output usage information
  -h, --queen-host [value]  Queen bees host to bind the listening server to (defaults to "127.0.0.1")
  -p, --queen-port <n>      The port on which the hive will be listening for queen bees (defaults to 8869)
  -s, --honey-script        Script commands which got send to new connected bee (defaults to "")
  -v, --version             Output the version number
```

### Queen bee Commands

- `.help`: display this message.
- `.list`: list connected bees.
- `.bind <n>`: bind to a bee and connect to his established socket.
- `.unbind`: detach the connection from the selected worker bee.
- `.uptime`: show hive uptime.
- `.credit`: display info on the project.
- `.quit`: close your connection.
- `.exit`: tear down the whole beehive.

### Optional systemd setup
Automatic, less privileged start at boot for systemd based systems.

- Configure your hive path and start up options at ./other/alveare.service (--bee-port, --queen-port...).
    ```
    ExecStart=/usr/local/src/alveare/cli.js --bee-port 2389
    ```
- ```shell
    # be root copy systemd service file
    cp ./other/alveare.service /etc/systemd/system/alveare.service
    
    # enable alveare start at system boot
    systemctl enable alveare
```

### Disclaimer

*This reverse shell should only be used in the lawful, remote administration of authorized systems. Accessing a computer network without authorization or permission is illegal*.

## Author

Rocco Musolino ([@roccomuso](https://twitter.com/roccomuso))

### License

MIT
