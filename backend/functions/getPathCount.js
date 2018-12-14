const functions = require('./functions')

module.exports = function getPathCount() {
  return new Promise(async (res, rej) => {
    try {
      const scanParams = {
        TableName: process.env.DYNAMO_TABLE,
        ExpressionAttributeValues: {
          ':a': {
            S: '.', // only return items where votes = .
          }, // that means the path object has been finalized
        },
        FilterExpression: 'votes = :a',
      }
      const results = await functions.scanTable(scanParams)

      return res({ Paths: results.Count, endPaths: 3 })
    } catch (e) {
      return rej(e)
    }
  })
}
