const functions = require('./functions')

module.exports = function verifyAddPathObj(pathId, obj) {
  return new Promise(async (res, rej) => {
    let pathArray
    try {
      // check if obj has the right props
      const { choiceL, choiceR } = obj
      if (!choiceL || !choiceR) throw new Error('obj missing choice params')
      let { q, effect, text, image } = choiceL
      if (typeof q !== 'string') throw new Error('obj missing choiceL.q')
      if (typeof effect !== 'string') throw new Error('obj missing choiceL.effect')
      if (typeof text !== 'string') throw new Error('obj missing choiceL.text')
      if (typeof image !== 'string') throw new Error('obj missing choiceL.image')
      if (!functions.isValidImage(image)) throw new Error('obj image invalid')
      if (!functions.isValidEffect(effect)) throw new Error('obj effect invalid')
      if (q.length > functions.maxQuestionLength) throw new Error(`obj question length is greater than ${functions.maxQuestionLength}`)
      if (text.length > functions.maxTextLength) throw new Error(`obj text length is greater than ${functions.maxTextLength}`)
      if (functions.containsBadWords(text)) throw new Error('contains profanity')
      if (functions.containsBadWords(q)) throw new Error('contains profanity')

      q = choiceR.q
      effect = choiceR.effect
      text = choiceR.text
      image = choiceR.image

      if (typeof q !== 'string') throw new Error('obj missing choiceL.q')
      if (typeof effect !== 'string') throw new Error('obj missing choiceL.effect')
      if (typeof text !== 'string') throw new Error('obj missing choiceL.text')
      if (typeof image !== 'string') throw new Error('obj missing choiceL.image')
      if (!functions.isValidImage(image)) throw new Error('obj image invalid')
      if (!functions.isValidEffect(effect)) throw new Error('obj effect invalid')
      if (q.length > functions.maxQuestionLength) throw new Error(`obj question length is greater than ${functions.maxQuestionLength}`)
      if (text.length > functions.maxTextLength) throw new Error(`obj text length is greater than ${functions.maxTextLength}`)
      if (functions.containsBadWords(text)) throw new Error('contains profanity')
      if (functions.containsBadWords(q)) throw new Error('contains profanity')

      // check if path is valid (this throws err if invalid)
      pathArray = await functions.decodePath(pathId)

      // check if the desired path
      // does not exist in DB (with votes = '.')
      const data = await functions.getFinalPathObj(pathId)
      const { Item } = data
      if (Item) throw new Error('that path already has been finalized') // if it already exists, dont add it.

      // go back 1 step in the path array
      let lastWord = pathArray[pathArray.length - 1]
      lastWord = lastWord.substring(0, lastWord.length - 1)
      if (lastWord.length === 0) {
        pathArray.pop()
      } else {
        pathArray[pathArray.length - 1] = lastWord
      }

      // check if the previous path:
      //      A: exists in the database
      //      B: has been voted on
      const previousPath = functions.encodePath(pathArray)
      const params = {
        ExpressionAttributeValues: {
          ':v1': {
            S: previousPath,
          },
        },
        Select: 'ALL_ATTRIBUTES',
        KeyConditionExpression: 'pathId = :v1',
        TableName: process.env.DYNAMO_TABLE,
      }

      // if there are 0 items that match query, getItem rejects
      const dbObjs = await functions.getItem(params, previousPath)
      const finalizedObj = await functions.formatAndPick(dbObjs.Items)
      // formatAndPick resolves single item if theres an item that  has been finalized
      // ie: the votes attribute = '.', otherrwise it resolves an array.
      if (Array.isArray(finalizedObj)) throw new Error('previous path not finished yet')
      return res()
    } catch (e) {
      return rej(e)
    }
  })
}
