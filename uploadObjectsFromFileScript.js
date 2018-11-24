const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB({region: 'us-east-1'})
const fs = require('fs')


function readJSON(fname) {
  return new Promise((res, rej) => {
    fs.readFile(fname, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function writeToDatabase(params) {
  return new Promise((res, rej) => {
    ddb.batchWriteItem(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

async function main() {
  const FILE = process.env.FILE || process.env.JSON
  const TABLE = process.env.TABLE

  try {    
    const contents = await readJSON(FILE)
    const data = JSON.parse(contents)

    // RequestItems only has one key: name of table
    Object.keys(data.RequestItems).forEach((key) => {
      data.RequestItems[TABLE] = data.RequestItems[key]
      delete data.RequestItems[key]
    })

    const result = await writeToDatabase(data)
    console.log(result)
  } catch(e) {
    console.log(e)
  }
}

main()
