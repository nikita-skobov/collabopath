const functions = require('./functions')

module.exports = function voteOnOwnObj(ip, voteId) {
  return new Promise(async (res, rej) => {
    const event = {
      body: JSON.stringify({ voteId }),
      headers: {
        'X-Forwarded-For': `${ip},`,
      },
    }
    const params = {
      FunctionName: process.env.LAMBDA_VOTE_FUNCTION,
      InvokeArgs: JSON.stringify(event),
    }
    try {
      const success = await functions.invokeAsync(params)
      return res(1)
    } catch (e) {
      return rej(e)
    }
  })
}
