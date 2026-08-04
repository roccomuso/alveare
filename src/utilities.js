
export function getBeesList (beesMap) {
  return Object.keys(beesMap).map((id) => {
    const { remoteAddress, remotePort } = beesMap[id]
    return `${id} -> ${remoteAddress}:${remotePort}`
  })
}

export function getIndexedBeesList (beesMap) {
  return Object.keys(beesMap).map((id, index) => {
    const { remoteAddress, remotePort } = beesMap[id]
    return `${index}) ${id} -> ${remoteAddress}:${remotePort}`
  })
}

export function broadcast (beesMap, msg) {
  Object.keys(beesMap).forEach((beeID) => {
    beesMap[beeID].write(`${msg}\n`)
  })
}

export function getBeeByIndex (beesMap, index) {
  return beesMap[Object.keys(beesMap)[index]]
}
