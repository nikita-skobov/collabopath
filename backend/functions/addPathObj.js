const functions = require('./functions')

module.exports = function addPathObj(pathId, obj, ip) {
  return new Promise(async (res, rej) => {
    try {
      await functions.verifyAddPathObj(pathId, obj)
      const voteID = functions.randomString(7)
      const rightNow = new Date()
      const params = {
        Item: {
          pathId: {
            S: pathId,
          },
          votes: {
            S: voteID,
          },
          obj: {
            S: JSON.stringify(obj),
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
        TableName: process.env.DYNAMO_TABLE,
        Expected: {
          votes: {
            Exists: false,
          },
        },
      }

      // firstVote throws error if it finds that the IP already exists with that pathId
      const firstVote = await functions.isFirstVote(pathId, ip)
      if (firstVote) {
        // if there are no entries with pathId, then that means this is the first entry
        // where voting will begin. Add this pathId to a queue, so that voting can be processed
        const queueParams = {
          MessageBody: pathId,
          QueueUrl: process.env.QUEUE_URL,
          DelaySeconds: process.env.QUEUE_DELAY,
        }
        await functions.sendMessage(queueParams)
      }
      await functions.putObject(params)
      return res(voteID)
    } catch (e) {
      let reason
      // obfuscate error messages.
      if (e.message) {
        if (e.message.includes('ip already')) reason = 6 // youve already submitted a path object at this path ID
        if (e.message.includes('characters found')) reason = 0 // path id has invalid characters
        if (e.message.includes('contains profanity')) reason = 10 // self-explanatory
        if (e.message.includes('finalized')) reason = 1 // the path youre trying to upload to has already been finalized
        if (e.message.includes('finished yet')) reason = 3
        if (e.message.includes('obj missing')) reason = 4
        if (e.message.includes('conditional request')) reason = '5. Try again.'
        if (e.message.includes('obj image invalid')) reason = 7 // user didnt use one of the allowed images
        if (e.message.includes('obj effect invalid')) reason = 8 // users effect isnt one of the allowed effects
        if (e.message.includes('length is greater than')) reason = 9 // text/question longer than allowed limit
        if (e.message.includes('provisioned throughput')) {
          return rej({
            statusCode: 503,
            body: { error: 'Server under intense load. Please try again later.' },
          })
        }
      } else if (e.statusCode) {
        // rejected by getItem... 404 pathObj not found
        // specifically, this happens when there is no PREVIOUS pathObj
        // example: user tries uploading pathobj with id=8,
        // previous pathId should be 100, if it doesnt exist in the database then
        // reject, because we only want to upload pathObjects if there is a previous
        // path Object
        if (e.statusCode === 404) reason = 2
      }

      return rej({
        statusCode: 400,
        body: { error: `Illegal id:${pathId} reason: ${reason}` },
      })
    }
  })
}
