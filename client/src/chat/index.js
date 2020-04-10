import io from 'socket.io-client'

let socket = null

export const initSocket = () => {
  socket = io()
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
  socket.on('message', (message) => {
    console.log('Rec Msg', message)
    cb(message)
  })
}

export const registerRoomData = (cb) => {
  if (!socket) {
    return
  }
  socket.on('roomData', (roomData) => {
    cb(roomData)
  })
}


export const destroySocket = () => {
  if (!socket) {
    return
  }
  socket.disconnect()
  socket = null
}

//
// socket.on('message', (message) => {
//   console.log(message)
//   const html = Mustache.render(messageTemplate, {
//     username: message.username,
//     message: message.text,
//     createdAt: moment(message.createdAt).format('h:mm a')
//   })
//   $messages.insertAdjacentHTML('beforeend', html)
// })
//
//
// socket.on('roomData', ({ room, users }) => {
//   const html = Mustache.render(sidebarTemplate, {
//     room,
//     users
//   })
//   document.querySelector('#sidebar').innerHTML = html
// })
//
// $messageForm.addEventListener('submit', (e) => {
//   e.preventDefault()
//
//   $messageFormButton.setAttribute('disabled', 'disabled')
//
//   const message = e.target.elements.message.value
//
//   socket.emit('sendMessage', message, (error) => {
//     $messageFormButton.removeAttribute('disabled')
//     $messageFormInput.value = ''
//     $messageFormInput.focus()
//
//     if (error) {
//       return console.log(error)
//     }
//
//     console.log('Message delivered!')
//   })
// })
