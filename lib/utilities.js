
module.exports = {

  getBeesList: (beesMap) => {
    let result = Object.keys(beesMap).map((id) => {
      let {remoteAddress, remotePort} = beesMap[id]
      return `${id} -> ${remoteAddress}:${remotePort}`
    })
    return result
  },

  getIndexedBeesList: (beesMap) => {
    let result = Object.keys(beesMap).map((id, index) => {
      let {remoteAddress, remotePort} = beesMap[id]
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
