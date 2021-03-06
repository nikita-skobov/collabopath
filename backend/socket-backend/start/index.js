const request = require('request')
const express = require('express')
const http = require('http')
const path = require('path')
const socketioclient = require('socket.io-client')
const AWS = require('aws-sdk')
const serverName = require('os').hostname()
const socketio = require('socket.io')
const crypto = require('crypto')

const myconfig = require('./myconfig.json')
const containsBadWords = require('./containsBadWords')
const {
  ipIsAllowed,
  recordIdAction,
  banIP,
  rememberId,
  getIpFromId,
  getBanList,
  mergeBanList,
} = require('./ipLimit')

const autoscale = new AWS.AutoScaling({
  region: myconfig.region,
})
const ec2 = new AWS.EC2({
  region: myconfig.region,
})
const lambda = new AWS.Lambda({
  region: myconfig.region,
})

const maxInputLength = 600
const serverNameId = getServerId(serverName)
const app = express()
const app2 = express()
const server2 = http.createServer(app2)
const server = http.createServer(app)
const has = Object.prototype.hasOwnProperty
const pSockets = {}
const badActorList = []
const FunctionName = myconfig.functionname

// for some reason it refuses to work cross-origin without
// explicitly setting these transport options. However I assumed
// that these were defaults?? So why should this matter????
const publ = socketio(server, {
  transports: ['websocket', 'xhr-polling'],
})

// server 2 listens on a port not accessible to outter internet
const privatesocketio = socketio(server2, {
  transports: ['websocket', 'xhr-polling'],
})

const privateNameSpace = '/private'
// private namespace only used for local ip connections
const privateio = privatesocketio.of(privateNameSpace)

// ========= HELPER FUNCTIONS ==================================
function getServerId(arr) {
  let id = 0
  // item array: [ip, 172, 30, 10, 100]
  arr.split('-').forEach((item, index) => {
    if (index) {
      // dont count index 0: ip
      id += parseInt(item, 10)
    }
  })

  return id
}

function invokeAsync(params) {
  return new Promise((res, rej) => {
    lambda.invokeAsync(params, (err) => {
      if (err) return rej(err)
      return res()
    })
  })
}

function giveFriendsBanList(list) {
  Object.keys(pSockets).forEach((key) => {
    pSockets[key].emit('banlist', list)
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

  s.on('banlist', (list) => {
    console.log('friend told me the ban list: ')
    console.log(list)
    mergeBanList(list)
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
      publ.emit(msg.type, msg.body)
    }
  })

  socket.on('banlist', (list) => {
    console.log('got ban list from friend: ')
    console.log(list)
    mergeBanList(list)
  })

  socket.on('auth', (msg) => {
    if (msg === 'abc12345') {
      // note this is not the actual auth code :)
      socket.authYes = true
      const list = getBanList()
      socket.emit('banlist', list)
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
  console.log('got public connection2')
  if (!has.call(socket.handshake.query, 'ua')) {
    // if they dont provide a ua query parameter, reject connection
    socket.disconnect()
    return null
  }

  const socketIP = socket.handshake.headers['x-forwarded-for']
  const socketUA = socket.handshake.query.ua

  // the production version also uses a secret salt, which is not shown here for obvious reasons
  const idTemp = crypto.createHash('sha1').update(socketIP).update(socketUA).digest('base64')
  const id = idTemp.substr(0, Math.floor(idTemp.length * 0.65))
  rememberId(id, socketIP)

  socket.on('i', (m) => {
    if (!containsBadWords(m) && ipIsAllowed(socketIP, id) && m.length <= maxInputLength) {
      const msg = {
        t: m,
        i: id,
        d: new Date().getTime(),
      }

      socket.broadcast.emit('o', msg)
      socket.emit('o', msg)

      Object.keys(pSockets).forEach((key) => {
        pSockets[key].emit('msg', { type: 'o', body: msg, ip: socketIP })
      })

      recordIdAction(id)
    }
  })

  socket.on('sni', () => {
    socket.emit('sno', serverNameId)
  })

  return null
})

app2.use(express.json())

// for some reason this is needed for CORS to work.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  next()
})

app2.post('/getip', (req, res) => {
  // there is more security checks here...
  // dont worry, this endpoint is not accessible to the public on the live site
  try {
    const { id } = req.body
    const ip = getIpFromId(id)
    if (ip) {
      res.send(ip)
    } else {
      res.send(`cannot find ip for id: ${id}`)
    }
  } catch (e) {
    res.send(e)
  }
})

app2.post('/ban/ip', (req, res) => {
  // there is more security checks here...
  // dont worry, this endpoint is not accessible to the public on the live site
  try {
    const { ip } = req.body
    banIP(ip)
    const list = getBanList()
    giveFriendsBanList(list)
    res.send('banned')
  } catch (e) {
    res.send(e)
  }
})

// used for debugging
app.get('/', (req, res) => {
  console.log(req.headers)
  console.log('app')
  res.send('yur on 3000')
})

app2.get('/', (req, res) => {
  console.log(req.headers)
  console.log('app2')
  res.send('yur on 3001')
})

server.listen(3000, () => {
  console.log('listening on 3000')
})

server2.listen(3001, () => {
  console.log('listening on 3001')
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
