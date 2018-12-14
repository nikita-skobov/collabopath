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
      const lastScanTime = parseInt(pathCount.Item.dateNum.N, 10)
      const rightNowTime = new Date().getTime()
      const scanAgainDelay = 10 * 60 * 1000 // 10 minutes
      if (rightNowTime - lastScanTime < scanAgainDelay) {
        // simply return the results from that item
        const obj = JSON.parse(pathCount.Item.obj.S)
        return res(obj)
      }

      // otherwise we should do another scan
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

      const rightNow = new Date()
      const putCountParams = {
        Item: {
          pathId: {
            S: 'count',
          },
          votes: {
            S: 'count',
          },
          obj: {
            S: JSON.stringify({ PathCount: results.Count }),
          },
          ip: {
            S: '.',
          },
          dateStr: {
            S: rightNow.toISOString(),
          },
          dateNum: {
            N: rightNow.getTime().toString(),
          },
        },
        TableName: process.env.DYNAMO_TABLE,
      }

      await functions.putObject(putCountParams)

      return res({ PathCount: results.Count })
    } catch (e) {
      return rej(e)
    }
  })
}
