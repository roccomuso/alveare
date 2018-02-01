
module.exports = {

  getBeesList: (bees) => {
    let result = Object.keys(bees).map((id) => {
      let {remoteAddress, remotePort} = bees[id]
      return `${id} -> ${remoteAddress}:${remotePort}`
    })
    return result
  },

  broadcast: (beesMap, msg) => {
    Object.keys(beesMap).forEach((beeID) => {
      beesMap[beeID].write(`${msg}\n`)
    })
  }

}
