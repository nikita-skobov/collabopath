const functions = require('./functions')

module.exports = function getPathObj(pathID) {
  return new Promise(async (res, rej) => {
    try {
      const params = {
        ExpressionAttributeValues: {
          ':v1': {
            S: pathID,
          },
        },
        Select: 'ALL_ATTRIBUTES',
        KeyConditionExpression: 'pathId = :v1',
        TableName: process.env.DYNAMO_TABLE,
      }
      functions.decodePath(pathID)
      const dbObj = await functions.getItem(params, pathID)
      const obj = await functions.formatAndPick(dbObj.Items)
      return res(obj)
    } catch (e) {
      const body = { error: '' }
      const err = { body, statusCode: 400 }
      if (e.message) {
        if (e.message.includes('provisioned throughput')) {
          err.statusCode = 503
          err.body.error = 'Server under intense load. Please try again later.'
          return rej(err)
        }
        if (e.message.includes('illegal characters') || e.message.includes('must provide') || e.message.includes('must be a string')) {
          err.body.error = 'Invalid Path ID'
          return rej(err)
        }
      }
      return rej(e)
    }
  })
}
