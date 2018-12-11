import io from 'socket.io-client'

import {
  socketEndpoint,
} from './dynamicVars'

function SocketManager(datastore) {
  const brain = datastore
  let socket = null

  const retObj = {
    connect: () => {
      socket = io.connect(socketEndpoint, {
        transports: ['websocket', 'xhr-polling'],
      })
    },
    disconnect: () => {
      socket.disconnect()
    },
  }

  brain.rememberMe('Sockets', retObj)
  return retObj
}

export default SocketManager
