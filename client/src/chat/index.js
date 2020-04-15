import io from 'socket.io-client'

let socket = null

export const initSocket = () => {
  socket = io({ forceNew: true })
}


export const joinGroup = (groupDetails, cb) => {
  if (!socket) {
    return
  }
  socket.emit('join', groupDetails, (error) => {
    if (error) {
      return cb && cb(error)
    }
    cb && cb()
  })
}

export const disJoinGroup = (groupDetails, cb) => {
  if (!socket) {
    return
  }
  socket.emit('disJoin', groupDetails, (error) => {
    if (error) {
      return cb && cb(error)
    }
    cb && cb()
  })
}

export const sendMessage = (message, cb) => {
  if (!socket) {
    return
  }
  socket.emit('sendMessage', message, (error) => {
    if (error) {
      return cb(error)
    }
    cb()
  })
}

export const registerMessage = (cb) => {
  if (!socket) {
    return
  }
  socket.on('message', cb)
}

export const unregisterMessage = (cb) => {
  if (!socket) {
    return
  }

  socket.off('message', cb)
  socket.removeListener('message', cb)
}

export const registerRoomData = (cb) => {
  if (!socket) {
    return
  }
  socket.on('roomData', cb)
}

export const unregisterRoomData = (cb) => {
  if (!socket) {
    return
  }

  socket.off('roomData', cb)
  socket.removeListener('roomData', cb)
}


export const emitKeepAlive = (errorCb) => {
  if (!socket) {
    return
  }
  socket.emit('keepAlive', errorCb)
}

export const destroySocket = (userId) => {
  if (!socket) {
    return
  }
  socket.emit('disconnectChat', userId)
  socket.disconnect()
  socket = null
}
