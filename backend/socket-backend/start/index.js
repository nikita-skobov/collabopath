const request = require('request')
const express = require('express')
const http = require('http')
const path = require('path')
const socketioclient = require('socket.io-client')
const AWS = require('aws-sdk')
const serverName = require('os').hostname()
const socketio = require('socket.io')
const myconfig = require('./myconfig.json')
const REGION = myconfig.region

const containsBadWords = require('./containsBadWords')

let FunctionName = ''

const autoscale = new AWS.AutoScaling({
  region: REGION,
})
const ec2 = new AWS.EC2({
  region: REGION,
})

const lambda = new AWS.Lambda({ region: REGION })

function invokeAsync(params) {
  return new Promise((res, rej) => {
    lambda.invokeAsync(params, (err) => {
      if (err) return rej(err)
      return res()
    })
  })
}

function connectToFriend(hostname, pSockets, auth) {
  const url = `http://${hostname}/private`
  console.log(`connecting to friend: ${url}`)

  const s = socketioclient.connect(url, { 'force new connection': true, transports: ['websocket', 'xhr-polling'], reconnection: false })
  s.on('connect', () => {
    pSockets[hostname] = s
    s.emit('auth', auth)
  })

  s.on('disconnect', () => {
    console.log(`WE DISCONNECTED FROM ${hostname}!`)
    delete pSockets[hostname]

    const invokeParams = {
      FunctionName,
      InvokeArgs: JSON.stringify({}),
    }

    try {
      setTimeout(async () => {
        // wait 2 minutes in case it is still terminating
        await invokeAsync(invokeParams)
      }, 120000)
    } catch (e) {
      console.log('failed to invoke')
      console.log(e)
    }
  })
}

function getMetaData(type) {
  return new Promise((res, rej) => {
    request(`http://169.254.169.254/latest/${type}`, (err, resp, body) => {
      if (err) return rej(err)
      return res(body)
    })
  })
}

function describeInstances(ids) {
  return new Promise((res, rej) => {
    const params = {
      InstanceIds: ids,
    }

    ec2.describeInstances(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function describeAutoScalingGroups(name) {
  return new Promise((res, rej) => {
    const params = {
      AutoScalingGroupNames: [name],
    }
    autoscale.describeAutoScalingGroups(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}

function describeAutoScalingInstances(id) {
  return new Promise((res, rej) => {
    const params = {
      InstanceIds: [id],
    }
    autoscale.describeAutoScalingInstances(params, (err, data) => {
      if (err) return rej(err)
      return res(data)
    })
  })
}


const app = express()
const server = http.createServer(app)
const has = Object.prototype.hasOwnProperty
const pSockets = {}
const badActorList = []
FunctionName = myconfig.functionname


const io = socketio(server, {
  transports: ['websocket', 'xhr-polling']
})

const privateio = io.of('/private')
const publ = io.of('/b')

privateio.on('connection', (socket) => {
  console.log('got friend connection')
  const host = socket.handshake.headers['x-real-ip']

  if (badActorList.indexOf(host) !== -1) {
    socket.disconnect()
    return null
  }

  socket.on('msg', (msg) => {
    const friendIP = socket.handshake.headers['x-real-ip']
    console.log(`got a message from FRIEND: ${friendIP}`)
    console.log(msg)
    if (socket.authYes) {
      publ.emit(msg.type, msg.body)
    }
  })

  socket.on('auth', (msg) => {
    if (msg === 'abc12345') {
      socket.authYes = true
    }
  })

  setTimeout(() => {
    if (!socket.authYes) {
      const socketIP = socket.handshake.headers['x-real-ip']
      socket.disconnect()
      badActorList.push(socketIP)
    }
  }, 2200)

  try {
    const spl = host.split('.')
    const hostname = `ip-${spl[0]}-${spl[1]}-${spl[2]}-${spl[3]}.ec2.internal`
    if (!has.call(pSockets, hostname)) {
      // only connect if not already connected
      console.log('NEW FRIEND')
      connectToFriend(hostname, pSockets, 'abc12345')
    }
  } catch (e) {
    // do nothing
  }
})


publ.on('connection', (socket) => {
  console.log('got public connection')
  socket.on('msgi2', (msg) => {
    socket.broadcast.emit('msgo2', msg)
    socket.emit('msgo2', msg)

    Object.keys(pSockets).forEach((key) => {
      pSockets[key].emit('msg', { type: 'msgo2', body: msg })
    })
  })

  socket.emit('servername', serverName)
})


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  next()
})

// used for debugging
// app.get('/', (req, res) => {
//   res.send(`please stop. server name: ${serverName}`)
// })


server.listen(3000, () => {
  console.log('listening on 3000')
})


async function main() {
  const myInstanceId = await getMetaData('meta-data/instance-id')
  const myPrivateDnsName = await getMetaData('meta-data/local-hostname')
  const instanceData = await describeAutoScalingInstances(myInstanceId)
  const { AutoScalingGroupName } = instanceData.AutoScalingInstances[0]
  const autoScaleData = await describeAutoScalingGroups(AutoScalingGroupName)
  const instances = autoScaleData.AutoScalingGroups[0].Instances

  const ids = []
  const myFriendsIps = []

  instances.forEach(({ InstanceId }) => {
    ids.push(InstanceId)
  })

  const data = await describeInstances(ids)
  const instances2 = []
  data.Reservations.forEach(({ Instances }) => {
    Instances.forEach(obj => instances2.push(obj))
  })

  instances2.forEach((item) => {
    const { PrivateDnsName } = item
    if (PrivateDnsName !== myPrivateDnsName) {
      myFriendsIps.push(PrivateDnsName)
    }
  })

  console.log(`my private dns: ${myPrivateDnsName}`)
  console.log('friends ips:')
  console.log(myFriendsIps)

  myFriendsIps.forEach((hostname) => {
    if (hostname === '') return null
    connectToFriend(hostname, pSockets, 'abc12345')
    return null
  })
}

main()
