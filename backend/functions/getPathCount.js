const functions = require('./functions')

module.exports = function getPathCount() {
  return new Promise(async (res, rej) => {
    try {
      const getItemParams = {
        TableName: process.env.DYNAMO_TABLE,
        Key: {
          pathId: {
            S: 'count',
          },
          votes: {
            S: 'count',
          },
        },
      }

      const pathCount = await functions.getItemSingle(getItemParams)
      console.log(pathCount)

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

      return res({ Paths: results.Count, pathCount })
    } catch (e) {
      return rej(e)
    }
  })
}
