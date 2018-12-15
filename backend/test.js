const AWS = require('aws-sdk')

const dynamodb = new AWS.DynamoDB({
  region: 'us-east-1',
  maxRetries: 2,
})

const has = Object.prototype.hasOwnProperty

function deleteItem(params) {
  return new Promise((res, rej) => {
    dynamodb.deleteItem(params, (err) => {
      if (err) return rej(err)
      return res(1)
    })
  })
}

function scanTable(params) {
  return new Promise((res, rej) => {
    dynamodb.scan(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

const deleteVoteParams = {
  TableName: 'dankstream-production-current-votes',
  Key: {
    pathId: {
      S: 'f',
    },
    dateNum: {
      N: '1543979381766',
    },
  },
}

const scanParams = {
  TableName: 'collabopath-production-pathobjects',
  ExpressionAttributeValues: {
    ':a': {
      S: '.',
    },
  },
  Limit: 59,
  FilterExpression: 'votes = :a',
}

function scanRecursively(params, oldResults) {
  return new Promise(async (res, rej) => {
    try {
      const myOldResults = oldResults || { Count: 0, ScannedCount: 0, Items: [] }
      const myParams = params

      const results = await scanTable(myParams)
      results.Count += myOldResults.Count
      results.ScannedCount += myOldResults.ScannedCount
      results.Items = [...results.Items, ...myOldResults.Items]

      if (has.call(results, 'LastEvaluatedKey')) {
        myParams.ExclusiveStartKey = results.LastEvaluatedKey
        const recursiveResults = await scanRecursively(myParams, results)
        return res(recursiveResults)
      }

      return res(results)
    } catch (e) {
      return rej(e)
    }
  })
}

async function main() {
  try {
    const results = await scanRecursively(scanParams)
    // await deleteItem(deleteVoteParams)
    console.log(results)
  } catch (e) {
    console.log(e)
  }
}

main()
