
module.exports = {

  getBeesList: (bees) => {
    let result = Object.keys(bees).map((id) => {
      let {remoteAddress, remotePort} = bees[id]
      return `${id} -> ${remoteAddress}:${remotePort}`
    })
    return result
  }

}
