module.exports = (function ips() {
  const has = Object.prototype.hasOwnProperty
  const lastIdAction = {}
  const idIpMap = {}
  const bannedList = []
  const ipRateLimit = 1000 * 2 // 2 seconds

  return {
    banIP: (ip) => {
      bannedList.push(ip)
    },

    getBanList: () => bannedList,

    mergeBanList: (list) => {
      list.forEach((item) => {
        if (bannedList.indexOf(item) === -1) {
          // current bannedList does not contain that item, so add it
          bannedList.push(item)
        }
      })
    },

    recordIdAction: (id) => {
      const rightNow = new Date().getTime()
      lastIdAction[id] = rightNow
    },

    ipIsAllowed: (ip) => {
      if (bannedList.indexOf(ip) !== -1) {
        // if the ip is in the bannedList they are NOT allowed
        return false
      }

      if (!has.call(lastIdAction, ip)) {
        // if new IP, then yes they are allowed
        return true
      }

      const rightNow = new Date().getTime()
      if (lastIdAction[ip] < rightNow - ipRateLimit) {
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
