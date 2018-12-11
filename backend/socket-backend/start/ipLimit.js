module.exports = (function ips() {
  const has = Object.prototype.hasOwnProperty
  const lastIpAction = {}
  const idIpMap = {}
  const bannedList = []
  const ipRateLimit = 1000 * 2 // 2 seconds

  return {
    banIP: (ip) => {
      bannedList.push(ip)
    },

    recordIpAction: (ip) => {
      const rightNow = new Date().getTime()
      lastIpAction[ip] = rightNow
    },

    ipIsAllowed: (ip) => {
      if (bannedList.indexOf(ip) !== -1) {
        // if the ip is in the bannedList they are NOT allowed
        return false
      }

      if (!has.call(lastIpAction, ip)) {
        // if new IP, then yes they are allowed
        return true
      }

      const rightNow = new Date().getTime()
      if (lastIpAction[ip] < rightNow - ipRateLimit) {
        // enough time has passed, so now they can send another message
        return true
      }

      // otherwise return false
      return false
    },

    rememberId: (id, ip) => {
      idIpMap[id] = ip
    },

    getIpFromId: (id) => {
      if (has.call(idIpMap, id)) {
        return idIpMap[id]
      }

      // otherwise does not exist, return null
      return null
    },
  }
}())
