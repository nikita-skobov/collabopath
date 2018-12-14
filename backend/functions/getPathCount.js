const functions = require('./functions')

module.exports = function getPathCount() {
  return new Promise((res, rej) => {
    try {
      return res()
    } catch (e) {
      return rej(e)
    }
  })
}
