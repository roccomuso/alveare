import React, { useEffect, useState } from 'react'
import { Box, Static, Text } from 'ink'
import moment from 'moment'

const h = React.createElement

function timestamp () {
  return moment().format('MMM Do YYYY, HH:mm:ss')
}

export function App ({ welcomeMsg, queenHost, queenPort, beeHost, beePort, hive, queen }) {
  const [bees, setBees] = useState({})
  const [events, setEvents] = useState([])

  useEffect(() => {
    function onBeeConnection (bee) {
      setBees((prev) => ({ ...prev, [bee.id]: { remoteAddress: bee.remoteAddress, remotePort: bee.remotePort } }))
      setEvents((prev) => [...prev, { key: `${bee.id}-in`, text: `[${timestamp()}] New bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id}) connected`, color: 'green' }])
    }
    function onBeeClose (bee) {
      setBees((prev) => {
        const next = { ...prev }
        delete next[bee.id]
        return next
      })
      setEvents((prev) => [...prev, { key: `${bee.id}-out`, text: `[${timestamp()}] Bee ${bee.remoteAddress}:${bee.remotePort} (${bee.id}) died`, color: 'red' }])
    }
    function onQueenConnection (queenBee) {
      setEvents((prev) => [...prev, { key: `${queenBee.id}-qin`, text: `[${timestamp()}] A queen bee just entered the Hive`, color: 'yellow' }])
    }
    function onQueenClose (queenBee) {
      setEvents((prev) => [...prev, { key: `${queenBee.id}-qout`, text: `[${timestamp()}] A queen bee quit`, color: 'yellow' }])
    }
    hive.on('connection', onBeeConnection)
    hive.on('clientClose', onBeeClose)
    queen.on('connection', onQueenConnection)
    queen.on('clientClose', onQueenClose)
    return () => {
      hive.off('connection', onBeeConnection)
      hive.off('clientClose', onBeeClose)
      queen.off('connection', onQueenConnection)
      queen.off('clientClose', onQueenClose)
    }
  }, [hive, queen])

  const beeEntries = Object.entries(bees)

  return h(Box, { flexDirection: 'column' },
    h(Text, { color: 'yellow' }, welcomeMsg),
    h(Box, { flexDirection: 'column', marginBottom: 1 },
      h(Text, null, 'Queen bees: ', h(Text, { color: 'cyan' }, `${queenHost}:${queenPort}`)),
      h(Text, null, 'Worker bees: ', h(Text, { color: 'cyan' }, `${beeHost}:${beePort}`))
    ),
    h(Static, { items: events }, (event) => h(Text, { key: event.key, color: event.color }, event.text)),
    h(Box, { flexDirection: 'column', marginTop: 1 },
      h(Text, { bold: true }, `Connected bees (${beeEntries.length}):`),
      beeEntries.length
        ? beeEntries.map(([id, bee]) => h(Text, { key: id }, `  ${id} -> ${bee.remoteAddress}:${bee.remotePort}`))
        : h(Text, { color: 'gray' }, '  none yet')
    )
  )
}
