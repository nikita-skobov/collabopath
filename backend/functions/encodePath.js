function encodePath(path) {
  if (!Array.isArray(path)) throw new Error('path must be an array')
  if (path.length === 0) throw new Error('path must have at least 1 element')
  if (path[0].length === 0) throw new Error('path cannot start with empty string')

  let encodedString = ''
  let prevString = ''
  path.forEach((item) => {
    if (typeof item !== 'string') throw new Error('each item in path must be a string')
    if (item.length > 4) throw new Error('each item strings length must be <= 4')

    if (prevString.length !== 0 && prevString.length < 4) {
      // only the last element of path can be less than a word
      throw new Error(`last string was less than a word, cannot have ${item} come afterwards`)
    }

    if (prevString.length === 4 && item.length < 4) {
      // we have reached the last element, and it happens to be
      // a less than a word (eg: '000' or '10'. A word would have 4 bits)
      encodedString += item
      prevString = item
      return null
    }

    if (prevString.length === 0 && item.length < 4) {
      // the first item is less than a word
      encodedString += item
      prevString = item
      return null
    }

    let n = 0
    let letterInd = 3
    item.split('').forEach((letter) => {
      const num = parseInt(letter, 10)
      if (Number.isNaN(num)) throw new Error('string must only contain 0s or 1s')
      if (num !== 0 && num !== 1) throw new Error('string must only contain 0s or 1s')

      n += num * (2 ** letterInd)
      letterInd -= 1
    })

    let letter = n.toString(16)
    if (letter === '0') letter = 'O'
    if (letter === '1') letter = 'L'

    encodedString += letter
    prevString = item
    return null
  })

  return encodedString
}


module.exports = encodePath
