const functions = require('./functions')

module.exports = function getPathCount() {
  return new Promise((res, rej) => {
    try {
      return res({ Paths: 10, endPaths: 3 })
    } catch (e) {
      return rej(e)
    }
  })
}
