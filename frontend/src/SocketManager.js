import io from 'socket.io-client'

import {
  socketEndpoint,
} from './dynamicVars'

function SocketManager(datastore) {
  const brain = datastore
  let socket = null

  const retObj = {
    on: (type, cb) => {
      socket.on(type, cb)
    },

    connect: (cb) => {
      socket = io.connect(socketEndpoint, {
        transports: ['websocket', 'xhr-polling'],
      })

      socket.on('connect', () => {
        cb(socket)
      })
    },

    disconnect: () => {
      socket.disconnect()
    },

    emit: (type, msg) => {
      socket.emit(type, msg)
    },
  }

  brain.rememberMe('Sockets', retObj)
  return retObj
}

export default SocketManager
