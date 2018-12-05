const AWS = require('aws-sdk')
// for running this locally it should be require('../../frontend/src/dynamicVars')
// eslint-disable-next-line
const dynamicVars = require('../frontend/src/dynamicVars')

const dynamodb = new AWS.DynamoDB({
  region: process.env.DYNAMO_REGION,
  maxRetries: 2,
})
const lambda = new AWS.Lambda({ region: process.env.LAMBDA_REGION })
const sqs = new AWS.SQS({
  region: process.env.SQS_REGION,
  maxRetries: 2,
})

const has = Object.prototype.hasOwnProperty
const functions = module.exports

function makeParams(source) {
  const p = process.env
  const params = { Item: {} }
  params.TableName = p.TABLE_NAME
  params.Item[p.TABLE_KEY] = {
    S: source.headers.ip,
  }
  return params
}

function sendMessage(params) {
  return new Promise((res, rej) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function deleteMessage(params) {
  return new Promise((res, rej) => {
    sqs.deleteMessage(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function processAllMessages() {
  return new Promise(async (res, rej) => {
    try {
      const url = process.env.QUEUE_URL
      const numMessages = await functions.getMessageCount(url)

      const params = {
        QueueUrl: url,
        MaxNumberOfMessages: 10,
      }
      await functions.processMessagesRecursive(numMessages, params)

      return res()
    } catch (e) {
      return rej(e)
    }
  })
}

function processMessagesRecursive(numMessages, params) {
  return new Promise(async (res, rej) => {
    try {
      let num = numMessages
      const numProcessed = await functions.processTenMessages(params)
      num -= numProcessed
      if (numMessages > 0) {
        await functions.processMessagesRecursive(num, params)
      }
      return res()
    } catch (e) {
      return rej(e)
    }
  })
}

function processTenMessages(params) {
  return new Promise((res, rej) => {
    sqs.receiveMessage(params, async (err, data) => {
      if (err) return rej(err)

      try {
        const pathIds = []
        if (has.call(data, 'Messages')) {
          data.Messages.forEach(item => pathIds.push({
            body: item.Body,
            receipt: item.ReceiptHandle,
          }))
          // invoke async function that takes this array and then processes the votes for all
          // the invoked function is the one that should delete the messages after the votes
          // have been counted
          const event = {
            pathIds,
          }

          const invokeParams = {
            FunctionName: process.env.LAMBDA_VOTE_COUNT_FUNCTION,
            InvokeArgs: JSON.stringify(event),
          }

          await functions.invokeAsync(invokeParams)
          return res(pathIds.length)
        }
        return res(0)
      } catch (e) {
        return rej(e)
      }
    })
  })
}

function getMessageCount(url) {
  return new Promise((res, rej) => {
    const params = {
      QueueUrl: url,
      AttributeNames: ['ApproximateNumberOfMessages'],
    }

    sqs.getQueueAttributes(params, (err, data) => {
      if (err) return rej(err)
      return res(parseInt(data.Attributes.ApproximateNumberOfMessages, 10))
    })
  })
}

function invokeAsync(params) {
  return new Promise((res, rej) => {
    lambda.invokeAsync(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function putObject(params) {
  return new Promise((res, rej) => {
    dynamodb.putItem(params, (err) => {
      if (err) return rej(err)
      return res(1)
    })
  })
}

function getItem(params, pathID) {
  return new Promise((res, rej) => {
    dynamodb.query(params, (err, data) => {
      if (err) return rej(err)
      if (data.Count === 0) {
        return rej({
          statusCode: 404,
          body: { error: `Path ID: ${pathID} not found` },
        })
      }
      return res(data)
    })
  })
}

function isFirstVote(pathId, ip) {
  return new Promise((res, rej) => {
    const params = {
      ExpressionAttributeValues: {
        ':v1': {
          S: pathId,
        },
      },
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'pathId = :v1',
      TableName: process.env.DYNAMO_TABLE,
      ConsistentRead: true,
    }

    dynamodb.query(params, (err, data) => {
      if (err) return rej(err)
      // firstVote = true when there are no other entries with given pathId
      if (data.Count === 0) return res(1)

      data.Items.forEach((item) => {
        const err2 = { message: 'ip already exists' }
        if (item.ip.S === ip) return rej(err2)
        return null
      })

      return res(0)
    })
  })
}


function formatAndPick(items) {
  return new Promise((res, rej) => {
    let done = false
    const list = []
    items.forEach((item) => {
      if (!done) {
        if (item.votes.S === '.') {
          done = true
          res(JSON.parse(item.obj.S))
        } else {
          const obj = JSON.parse(item.obj.S)
          obj.voteId = item.votes.S
          list.push(obj)
        }
      }
    })
    if (!done) {
      // this means that none of the items is the final voted item,
      // so return a list of all items
      return res(list)
    }
    return rej(new Error('this should not happen'))
  })
}


function getFinalPathObj(pathID) {
  return new Promise(async (res, rej) => {
    const params = {
      TableName: process.env.DYNAMO_TABLE,
      Key: {
        pathId: {
          S: pathID,
        },
        votes: {
          S: '.',
        },
      },
    }

    dynamodb.getItem(params, (err, data) => {
      if (err) rej(err)
      res(data)
    })
  })
}

function makeRandomId(n) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  // eslint-disable-next-line
  for (var i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function getVoteItems({ body, receipt }) {
  return new Promise(async (res, rej) => {
    try {
      const params = {
        ExpressionAttributeValues: {
          ':v1': {
            S: body, // body is pathId
          },
        },
        Select: 'ALL_ATTRIBUTES',
        KeyConditionExpression: 'pathId = :v1',
        TableName: process.env.DYNAMO_TABLE,
      }

      // first, query DB, and get back list of items with given pathId,
      const data = await functions.getItem(params, body)
      if (!has.call(data, 'Items')) throw new Error('missing Items attribute')

      let maxVoteCount = 0
      let voteWinner = {}
      const promiseList = []
      // for all of those items, count the votes by querying the vote table, and seeing
      // how many entries each voteId has.
      data.Items.forEach((item) => {
        promiseList.push(functions.countVotes(item.votes.S))
      })

      const votesList = await Promise.all(promiseList)
      // the voteId with the most amount of entries (each entry has a different IP)
      // is the winner
      votesList.forEach((count, ind) => {
        if (count > maxVoteCount) {
          maxVoteCount = count
          voteWinner = data.Items[ind]
        }
      })

      // set votes = . because this signifies its the final entry, and prevents
      // others from voting on that pathId
      voteWinner.votes.S = '.'

      // adds time of vote to the finalized object
      const rightNow = new Date()
      voteWinner.dateStr = {}
      voteWinner.dateNum = {}
      voteWinner.dateStr.S = rightNow.toISOString()
      voteWinner.dateNum.N = rightNow.getTime().toString()

      const putParams = {
        TableName: process.env.DYNAMO_TABLE,
        Item: voteWinner,
      }
      await functions.putObject(putParams)

      // params to delete message from queue
      const deleteParams = {
        QueueUrl: process.env.QUEUE_URL,
        ReceiptHandle: receipt,
      }

      // params to delete item from current vote table
      const deleteVoteParams = {
        TableName: process.env.DYNAMO_CURRENT_VOTE_TABLE,
        Key: {
          pathId: {
            S: voteWinner.pathId.S,
          },
        },
      }

      // delete the message so that it doesnt get processed again by the voteCheck handler.
      await functions.deleteMessage(deleteParams)

      // once item is finalized, remove it from the current vote table because it is
      // no longer being voted on!
      await functions.deleteItem(deleteVoteParams)
      return res()
    } catch (e) {
      return rej(e)
    }
  })
}

function countVotes(voteID) {
  return new Promise((res, rej) => {
    const params = {
      TableName: process.env.DYNAMO_VOTE_TABLE,
      ExpressionAttributeValues: {
        ':v1': {
          S: voteID,
        },
      },
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'voteId = :v1',
    }

    dynamodb.query(params, (err, data) => {
      if (err) return rej(err)
      return res(data.Count)
    })
  })
}

function addSuggestion(text, ip) {
  return new Promise(async (res, rej) => {
    try {
      if (text.length > dynamicVars.maxSuggestionLength) {
        return rej({ body: { error: `Suggestion cannot contain more than ${dynamicVars.maxSuggestionLength} characters` } })
      }

      const rightNow = new Date()

      const params = {
        TableName: process.env.DYNAMO_SUGGESTION_TABLE,
        Item: {
          text: {
            S: text,
          },
          ip: {
            S: ip,
          },
          dateStr: {
            S: rightNow.toISOString(),
          },
          dateNum: {
            N: rightNow.getTime().toString(),
          },
        },
      }

      await putObject(params)
      return res()
    } catch (e) {
      return rej(e)
    }
  })
}


module.exports.addPathObj = require('./addPathObj')
module.exports.voteOnOwnObj = require('./voteOnOwnObj')
module.exports.verifyAddPathObj = require('./verifyAddPathObj')
module.exports.getPathObj = require('./getPathObj')
module.exports.voteOnPathObj = require('./voteOnPathObj')
module.exports.encodePath = require('./encodePath')
module.exports.decodePath = require('./decodePath')

module.exports.isFirstVote = isFirstVote
module.exports.formatAndPick = formatAndPick
module.exports.invokeAsync = invokeAsync
module.exports.putObject = putObject
module.exports.randomString = makeRandomId
module.exports.getFinalPathObj = getFinalPathObj
module.exports.getItem = getItem
module.exports.makeParams = makeParams
module.exports.sendMessage = sendMessage
module.exports.processAllMessages = processAllMessages
module.exports.getMessageCount = getMessageCount
module.exports.processTenMessages = processTenMessages
module.exports.processMessagesRecursive = processMessagesRecursive
module.exports.getVoteItems = getVoteItems
module.exports.countVotes = countVotes
module.exports.deleteMessage = deleteMessage
module.exports.addSuggestion = addSuggestion

module.exports.isValidImage = dynamicVars.isValidImage
module.exports.isValidEffect = dynamicVars.isValidEffect
module.exports.maxQuestionLength = dynamicVars.MakePath.maxQuestionLength
module.exports.maxTextLength = dynamicVars.MakePath.maxTextLength
module.exports.containsBadWords = dynamicVars.containsBadWords
