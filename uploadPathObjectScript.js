const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB({region: 'us-east-1'})
const pathObjects = require('./frontend/src/dynamicVars').pathObjects
// ddb.describeTable({TableName: 'test_pathgame'}, (err, data) => {
//   console.log(err)
//   console.log(data)
// })
const TABLE_NAME = process.env.TABLE
const params = {
  RequestItems: {
    [TABLE_NAME]: [],
  },
}
Object.keys(pathObjects).forEach((id) => {
  console.log(id)
  if (id !== '.') {
    params.RequestItems[TABLE_NAME].push({
      PutRequest: {
        Item: {
          pathId: {
            S: id,
          },
          votes: {
            S: '.',
          },
          ip: {
            S: '.',
          },
          obj: {
            S: JSON.stringify(pathObjects[id])
          },
        }
      }
    })
  }
})

// params.RequestItems.test_pathgame.forEach((item) => {
//   console.log(item.PutRequest.Item)
// })

ddb.batchWriteItem(params, (err, data) => {
  console.log(err)
  console.log(data)
})
