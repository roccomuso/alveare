
module.exports = {

  getBeesList: (beesMap) => {
    const result = Object.keys(beesMap).map((id) => {
      const { remoteAddress, remotePort } = beesMap[id]
      return `${id} -> ${remoteAddress}:${remotePort}`
    })
    return result
  },

  getIndexedBeesList: (beesMap) => {
    const result = Object.keys(beesMap).map((id, index) => {
      const { remoteAddress, remotePort } = beesMap[id]
      return `${index}) ${id} -> ${remoteAddress}:${remotePort}`
    })
    return result
  },

  broadcast: (beesMap, msg) => {
    Object.keys(beesMap).forEach((beeID) => {
      beesMap[beeID].write(`${msg}\n`)
    })
  },

  getBeeByIndex: (beesMap, index) => {
    return beesMap[Object.keys(beesMap)[index]]
  }

}
