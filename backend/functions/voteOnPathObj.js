const functions = require('./functions')

module.exports = function voteOnPathObj(voteId, userIP, newVote) {
  return new Promise(async (res, rej) => {
    const rightNow = new Date()

    const params = {
      Item: {
        voteId: {
          S: voteId,
        },
        ip: {
          S: userIP,
        },
        dateStr: {
          S: rightNow.toISOString(),
        },
        dateNum: {
          // UGh! why does dynamoDB require a NUMBER to be formatted
          // as a STRING??
          N: rightNow.getTime().toString(),
        },
      },
      TableName: process.env.DYNAMO_VOTE_TABLE,
    }
    const queryParams = {
      ExpressionAttributeValues: {
        ':v1': {
          S: voteId,
        },
      },
      Select: 'ALL_ATTRIBUTES',
      KeyConditionExpression: 'voteId = :v1',
      TableName: process.env.DYNAMO_VOTE_TABLE,
    }
    try {
      if (!newVote) {
        // if this is not a new vote entry, then we do want to check that
        // the table does already have an item with voteId
        // otherwise, if this is the first entry of that voteId, newVote will be set to 1
        // getItem() rejects if no items are found
        // basically prevents voting on a voteId that doesnt exist in the vote table
        // whenever a new path obj is added to the main table
        // if it is the first path obj for that pathId
        // a voteId entry is made automatically into the vote_table
        const response1 = await functions.getItem(queryParams, voteId)
        // response1 isnt used anywhere, but I fear removing it might break something...
      }
      const response = await functions.putObject(params)
      if (response) {
        return res(1)
      }
      return rej(new Error('catastrophic error!'))
    } catch (e) {
      return rej({
        statusCode: 400,
        body: { error: 'failed to vote' },
      })
    }
  })
}
