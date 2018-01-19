# :honeybee: alveare

> Multi-client, multi-threaded reverse shell handler written in Node.js :honey_pot:

Alveare (`hive` in italian) lets you listen for incoming reverse connection, list them, handle and bind the sockets.

...Screen missing...

## Install

> npm install -g alveare

### How it works

1. Start alveare: `alveare -p 2389 --password s3cr3t`
2. Connect to it: `telnet <server ip> <port>`
3. Wait for connections...

You can spawn a [netcat reverse-shell](https://github.com/roccomuso/netcat#reverse-shell) and increase the number of incoming connections.

### Commands

- `.help`: ...
...

### Disclaimer

This reverse shell should only be used in the lawful, remote administration of authorized systems. Accessing a computer network without authorization or permission is illegal.

## Author

Rocco Musolino ([@roccomuso](https://twitter.com/roccomuso))

### License

MIT
