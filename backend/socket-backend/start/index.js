const request = require('request')
const express = require('express')
const http = require('http')
const path = require('path')
const socketioclient = require('socket.io-client')
const AWS = require('aws-sdk')
const serverName = require('os').hostname()
const socketio = require('socket.io')

const myconfig = require('./myconfig.json')
const containsBadWords = require('./containsBadWords')
const { ipIsAllowed, recordIpAction, banIP } = require('./ipLimit')

const autoscale = new AWS.AutoScaling({
  region: myconfig.region,
})
const ec2 = new AWS.EC2({
  region: myconfig.region,
})
const lambda = new AWS.Lambda({
  region: myconfig.region,
})

const app = express()
const server = http.createServer(app)
const has = Object.prototype.hasOwnProperty
const pSockets = {}
const badActorList = []
const FunctionName = myconfig.functionname

// for some reason it refuses to work cross-origin without
// explicitly setting these transport options. However I assumed
// that these were defaults?? So why should this matter????
const io = socketio(server, {
  transports: ['websocket', 'xhr-polling'],
})

// private namespace only used for local ip connections
const privateio = io.of('/private')

// public namepsace used for public chat messaging
const publ = io.of('/b')

// ========= HELPER FUNCTIONS ==================================
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

    try {
      const invokeParams = {
        FunctionName,
        InvokeArgs: JSON.stringify({}),
      }
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
// =============== END OF HELPER FUNCTIONS ==================================

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
      recordIpAction(msg.ip)
      publ.emit(msg.type, msg.body)
    }
  })

  socket.on('auth', (msg) => {
    if (msg === 'abc12345') {
      // note this is not the actual auth code :)
      socket.authYes = true
    }
  })

  setTimeout(() => {
    // anyone connecting to private endpoint only has about
    // 2 seconds to authorize, otherwise they wont be allowed to connect
    // again.
    if (!socket.authYes) {
      const socketIP = socket.handshake.headers['x-real-ip']
      socket.disconnect()
      banIP(socketIP)
      badActorList.push(socketIP)
    }
  }, 2200)

  try {
    // spl is an ipv4 array eg: 169.200.14.108 becomes: ['169', '200', '14', '108']
    const spl = host.split('.')

    // this is an ec2 internal hostname. its used to connect to instances locally
    // without having to go over the public internet, thus the socket connections
    // should be faster.
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


// public sockets! this is where the chat actually happens
publ.on('connection', (socket) => {
  console.log('got public connection')
  socket.on('msgi2', (msg) => {
    const socketIP = socket.handshake.headers['x-real-ip']
    if (!containsBadWords(msg) && ipIsAllowed(socketIP)) {
      socket.broadcast.emit('msgo2', msg)
      socket.emit('msgo2', msg)

      Object.keys(pSockets).forEach((key) => {
        pSockets[key].emit('msg', { type: 'msgo2', body: msg, ip: socketIP })
      })

      recordIpAction(socketIP)
    }
  })

  socket.emit('servername', serverName)
})


// for some reason this is needed for CORS to work.
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
  // this function starts by calling the route check function.
  // that lambda function changes route53 records to include all IPs from the
  // auto scaling group
  const invokeParams = {
    FunctionName,
    InvokeArgs: JSON.stringify({}),
  }

  await invokeAsync(invokeParams)

  // next, this function finds its instance id, from that it finds
  // the AutoScalingGroupName, and from that it calls describeAutoScalingGroups
  // to find all instances in the autoscaling group. After it
  // gets all the instances, it connects to every one of them via their
  // hostname
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
