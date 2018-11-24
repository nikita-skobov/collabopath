const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB({region: 'us-east-1'})
const fs = require('fs')

function scanItems(params) {
  return new Promise((res, rej) => {
    ddb.scan(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function writeFile(fname, data) {
  return new Promise((res, rej) => {
    fs.writeFile(fname, data, (err, out) => {
      if (err) return rej(err)
      return res(out)
    })
  })
}

async function main() {
  console.warn('NOTE: this script does not handle pagination if there are more items in the database than AWS DynamoDB can return. If there are many items in the database, please rewrite this script.')
  const TABLE = process.env.TABLE
  const OUTPUT = process.env.OUTPUT

  const params = {
    TableName: TABLE,
  }

  try {
    const data = await scanItems(params)
    const { Items, LastEvaluatedKey } = data

    if (LastEvaluatedKey) {
      console.warn('LAST EVALUATED KEY EXISTS:')
      console.warn(LastEvaluatedKey)
    }

    const batchParams = {
      RequestItems: {
        [TABLE]: [],
      },
    }
    Items.forEach((item) => {
      const formattedItem = {}

      Object.keys(item).forEach((key) => {
        formattedItem[key] = item[key]
      })

      batchParams.RequestItems[TABLE].push({
        PutRequest: {
          Item: formattedItem,
        },
      })
    }) // end of Items.forEach

    const writeResult = writeFile(OUTPUT, JSON.stringify(batchParams))

  } catch(e) {
    console.log(e)
  }
}

main()
