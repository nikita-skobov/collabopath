function decodePath(path) {
  if (!path) throw new Error('must provide a path argument')
  if (typeof path !== 'string') throw new Error('path must be a string')

  // only allow these characters, and case matters
  const reg = new RegExp('((?!(a|b|c|d|e|f|0|1|2|3|4|5|6|7|8|9|O|L)).)')
  if (reg.test(path)) throw new Error('illegal characters found in string')

  const list = []
  let lastWord = ''
  let zerosInARow = 0
  let onesInARow = 0
  const STOP = 4
  path.split('').forEach((char) => {
    if (zerosInARow > 3) throw new Error('illegal characters found in string')
    if (onesInARow > 3) throw new Error('illegal characters found in string')

    if (char !== '0') {
      zerosInARow = 0
    }
    if (char !== '1') {
      onesInARow = 0
    }

    // i am embarassed at this obnoxiously long switch statement...
    // ideally I should have used some parseInt method and set it to base 16
    // or something, but I wrote this at night, and was too tired to look up
    // how to do that properly... I apologize...
    switch (char) {
      case 'a':
        lastWord += '1010'
        break
      case 'b':
        lastWord += '1011'
        break
      case 'c':
        lastWord += '1100'
        break
      case 'd':
        lastWord += '1101'
        break
      case 'e':
        lastWord += '1110'
        break
      case 'f':
        lastWord += '1111'
        break
      case 'O':
        lastWord += '0000'
        break
      case 'L':
        lastWord += '0001'
        break
      case '2':
        lastWord += '0010'
        break
      case '3':
        lastWord += '0011'
        break
      case '4':
        lastWord += '0100'
        break
      case '5':
        lastWord += '0101'
        break
      case '6':
        lastWord += '0110'
        break
      case '7':
        lastWord += '0111'
        break
      case '8':
        lastWord += '1000'
        break
      case '9':
        lastWord += '1001'
        break
      case '0':
        zerosInARow += 1
        lastWord += '0'
        break
      case '1':
        onesInARow += 1
        lastWord += '1'
        break
      default:
        console.log('THERE IS NO DEFAULT HERE!')
    }
    if (lastWord.length === STOP) {
      list.push(lastWord)
      lastWord = ''
    }
  })

  if (lastWord.length > 0) list.push(lastWord)
  return list
}

module.exports = decodePath
