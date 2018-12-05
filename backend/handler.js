// eslint-disable-next-line
'use strict';

const functions = require('./functions/functions')

const { getPathObj } = functions

const has = Object.prototype.hasOwnProperty

// api route for the suggestion form on the front page
module.exports.addSuggestion = async (event, context) => {
  let headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `https://${process.env.DOMAIN}.com`, // Required for CORS support to work
    'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  }
  let statusCode = 500
  let body = { error: 'Unable to complete request: addSuggestion' }
  try {
    if (!event.body) {
      const err = { statusCode: 400, body: { error: 'Missing body' } }
      throw err
    }

    const { text } = JSON.parse(event.body)

    if (!text) {
      const err = { statusCode: 400, body: { error: 'Missing parameter: text' } }
      throw err
    }

    let userIP = event.headers['X-Forwarded-For']
    if (userIP.includes(',')) {
      // get the real user ip, not the CDN ip
      userIP = userIP.substr(0, userIP.indexOf(','))
    } else if (userIP.length === 0) {
      // if x-forwarded-for is empty, use the CDN ip as last resort
      userIP = event.requestContext.identity.sourceIp
    }
    // the last case is if the length is NOT 0, then the
    // x-forwarded-for string is the entire user ip, no need
    // for stripping commas

    await functions.addSuggestion(text, userIP)
    body = {}
    statusCode = 200
  } catch (e) {
    headers = e.headers || headers
    statusCode = e.statusCode || statusCode
    body = e.body || body
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  }
}

// api route for getting a list of all path ids that are currently being voted on
module.exports.getVotes = async (event, context) => {
  let headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `https://${process.env.DOMAIN}.com`, // Required for CORS support to work
    'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    'Cache-Control': 'max-age=30', // this route shouldnt be cached for very long
  }
  let statusCode = 500
  let body = { error: 'Unable to complete request: getVotes' }

  try {
    const currentVotes = await functions.scanTable({
      TableName: process.env.DYNAMO_CURRENT_VOTE_TABLE,
    })

    body = []

    currentVotes.Items.forEach((item) => {
      const voteItem = {
        pathId: item.pathId.S,
        dateNum: item.dateNum.N,
      }
      body.push(voteItem)
    })
    statusCode = 200
  } catch (e) {
    headers = e.headers || headers
    statusCode = e.statusCode || statusCode
    body = e.body || body
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  }
}

// api route for adding a path to the game.
// there are two types of path additions: a path addition when its
// the first path at a given path ID, or a path addition when the path
// is not finalized yet.
module.exports.addPath = async (event, context) => {
  let headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `https://${process.env.DOMAIN}.com`, // Required for CORS support to work
    'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  }
  let statusCode = 500
  let body = { error: 'Unable to complete request: addPath' }
  try {
    if (!event.body) {
      const err = { statusCode: 400, body: { error: 'Missing body' } }
      throw err
    }

    const { pathId, obj } = JSON.parse(event.body)

    if (!pathId) {
      const err = { statusCode: 400, body: { error: 'Missing parameter: pathId' } }
      throw err
    }
    if (!obj) {
      const err = { statusCode: 400, body: { error: 'Missing parameter: obj' } }
      throw err
    }
    let userIP = event.headers['X-Forwarded-For']
    if (userIP.includes(',')) {
      // get the real user ip, not the CDN ip
      userIP = userIP.substr(0, userIP.indexOf(','))
    } else if (userIP.length === 0) {
      // if x-forwarded-for is empty, use the CDN ip as last resort
      userIP = event.requestContext.identity.sourceIp
    }
    // the last case is if the length is NOT 0, then the
    // x-forwarded-for string is the entire user ip, no need
    // for stripping commas

    const voteID = await functions.addPathObj(pathId, obj, userIP)

    const voted = await functions.voteOnOwnObj(userIP, voteID)

    if (voted) {
      statusCode = 200
      body = {}
    }
  } catch (e) {
    headers = e.headers || headers
    statusCode = e.statusCode || statusCode
    body = e.body || body
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  }
}

// this function is not an api method, but it is used internally
// it runs on a schedule (5 minutes), and it just checks all messages
// in a queue, and processes as many as it can (SQS does not guarantee that it can read
// all available messages at a given time). if it fails on any of them, it doesnt delete
// from the queue, and instead they get processed on the next time.
// by 'processing' the messages, what this function actually does is it
// reads as many messages from the queue as it can, and for each message
// it invokes a lambda function asynchronously. that lambda function then only
// has to worry about a single path ID to read. this way, the function won't timeout
// in the case where there are many messages to process at once.
module.exports.voteCheck = async (event, context) => {
  let statusCode = 400
  try {
    await functions.processAllMessages()
    statusCode = 200
  } catch (e) {
    statusCode = e.statusCode || statusCode
  }

  return {
    statusCode,
  }
}

// this is the function that gets called by voteCheck when there are messages to process.
// this function simply reads all the vote entries from the main dynamoDB table with a given path ID
// and for each entry, it counts how many votes it has. the entry with the most amount
// of votes wins, and gets entered into the dynamo table with voteID = . this indicates
// that it has been finalized
module.exports.voteCount = async (event, context) => {
  let statusCode = 400
  try {
    const messages = event.pathIds

    // this way Promise.All will succeed no matter what.
    // if one of the getVoteItem call fails for some reason
    // it will be tried again next time voteCheck gets run.
    const resOrRej = (item) => {
      return new Promise(async (res) => {
        try {
          await functions.getVoteItems(item)
          return res()
        } catch (e) {
          return res()
        }
      })
    }

    const countedList = []
    messages.forEach(item => countedList.push(resOrRej(item)))

    await Promise.all(countedList)
    statusCode = 200
  } catch (e) {
    statusCode = e.statusCode || statusCode
  }

  return {
    statusCode,
  }
}

// used when a user clicks on the vote for .... button
// it simply takes the vote ID, and the users IP
// it adds the users IP as a secondary key to the vote table, where
// the primary key is the vote ID. later when vote Count happens,
// it takes a set of vote IDs, and for each vote ID it counts how many
// ip entries there are, which equates to how many votes there are.
module.exports.votePath = async (event, context) => {
  let headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `https://${process.env.DOMAIN}.com`, // Required for CORS support to work
    'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  }

  let statusCode = 500
  let body = { error: 'Unable to complete request: votePath' }

  try {
    let userIP = event.headers['X-Forwarded-For']
    if (userIP.includes(',')) {
      // get the real user ip, not the CDN ip
      userIP = userIP.substr(0, userIP.indexOf(','))
    } else if (userIP.length === 0) {
      // if x-forwarded-for is empty, use the CDN ip as last resort
      userIP = event.requestContext.identity.sourceIp
    }
    // the last case is if the length is NOT 0, then the
    // x-forwarded-for string is the entire user ip, no need
    // for stripping commas

    const { voteId } = JSON.parse(event.body)

    if (!voteId) {
      const err = { statusCode: 400, body: { error: 'missing vote id' } }
      throw err
    }

    // if this event was from an HTTP request, then this is not a new Item
    // otherwise it is, so set a flag, which tells voteOnPathObj not to
    // check if voteId exists, and just enter it automatically
    const newItem = event.httpMethod ? 0 : 1

    const success = await functions.voteOnPathObj(voteId, userIP, newItem)
    if (success) {
      body = {}
      statusCode = 200
    }
  } catch (e) {
    headers = e.headers || headers
    statusCode = e.statusCode || statusCode
    body = e.body || body
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  }
}

// given a path ID, return either a single, finalized object
// or an array of non-finalized objects for the user to sort through,
// and vote on their favorites
// finalized path objects get caches, but non-finalized only get cached
// for a few seconds, so that the next time the user refreshes they can see if
// there have been new additions
module.exports.getPath = async (event, context) => {
  let headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `https://${process.env.DOMAIN}.com`, // Required for CORS support to work
    'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    'Cache-Control': 'max-age=2', // by default dont cache for long
  }

  let statusCode = 500
  let body = { error: 'Unable to complete request: getpath' }

  try {
    const pathId = event.pathParameters.id
    const obj = await getPathObj(pathId)
    body = { obj, pathId }
    if (!Array.isArray(obj)) {
      // if the object is finalized, cache it for longer
      headers['Cache-Control'] = 'max-age=7200'
    }
    statusCode = 200
  } catch (e) {
    headers = e.headers || headers
    statusCode = e.statusCode || statusCode
    body = e.body || body
    // just in case, set header cache control back to 2
    headers['Cache-Control'] = 'max-age=2'
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  }
}
