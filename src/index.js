const express = require('express')
const path = require('path')

const http = require('http')
const socketio = require('socket.io')
const fs = require('fs')
const keys = require('../config/keys')

const isProd = (process.env.NODE_ENV !== 'production')

require('./db/mongoose')

const app = express()

const port = process.env.PORT || 5000

app.use(express.json())
require('./routers/auth')(app)
require('./routers/user')(app)
require('./routers/chatGroups')(app)

const publicDirectoryPath = isProd ? path.join(__dirname, '../client/build') : path.join(__dirname, '../public')

// Express will serve up production assets and static folder (UI)
app.use(express.static(publicDirectoryPath))

if (isProd) {
// Express will serve index.html for rest of unknown routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(publicDirectoryPath, 'index.html'))
  })
}

// Create the chatlog directory if not exists
const chatDirectoryPath = path.join(__dirname, '../chatlogs')

if (!fs.existsSync(chatDirectoryPath)) {
  console.log('Chatlogs dir is not found!! Creating it.')
  fs.mkdirSync(chatDirectoryPath)
}


const server = http.createServer(app)
const io = socketio(server)
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
  addUser, removeUser, getUser, getUsersInRoom, getAllUsers
} = require('./utils/users')


let chatLogger = {}
const openWriterStream = (writerId) => {
  const chatPath = path.join(chatDirectoryPath, writerId)
  chatLogger[writerId] = fs.createWriteStream(chatPath, {
    flags: 'a+' // 'a' means appending (old data will be preserved)
  })
  return chatLogger[writerId]
}

io.on('connection', (socket) => {
  console.log('Connect WebSocket id:', socket.id)

  socket.on('join', (options, callback) => {
    console.log(`New Join Request user: ${options.userId} , room: ${options.room}`)
    const { error, user } = addUser({ id: options.userId, ...options })

    if (error || !user) {
      console.log('Error', (error || 'user not found'))
      return callback(error || 'user not found')
    }

    // Tell the current socket to join specific room
    socket.join(user.room)
    const chatPath = path.join(chatDirectoryPath, user.room)
    openWriterStream(user.room)

    // This emit will send only to its connection
    // socket.emit('message', generateMessage('Admin', 'Welcome!'))
    // This broadcast.to will send all scokets belong to that room apart current connection
    // socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
    // This io.to will send all scokets belong to that room + current connection

    fs.readFile(chatPath, 'utf8', (err, dt) => {
      if (err) {
        console.log('File Read err', err)
        dt = ''
      }
      console.log(`Emit RoomData user: ${user.id} , room: ${user.room}`)
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
        chatLogs: dt
      })

      // This callback will inform UI that all is well
      callback()
    })
  })

  socket.on('keepAlive', (callback) => {
    console.log('keepAlive', socket.id)
  })

  socket.on('sendMessage', ({
    userId, message, room, username
  }, callback) => {
    console.log(`Send Message user: ${userId} , room: ${room}`)
    io.to(room).emit('message', generateMessage(username, message, room, chatLogger[room]))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    console.log('Send Location :', coords.userId)
    const user = getUser(coords.userId)
    if (!user) {
      console.log('User Not found')
      return
    }
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  const removeChatUser = (userId, callback) => {
    const user = removeUser(userId)

    if (!user) {
      console.log('User Not found')
      return callback && callback('User not found')
    }
    console.log('Removed User From Cache : ', user.id)

    // Close the chatLogger only if all the users are disJoined
    const allUserInSameRoom = getUsersInRoom(user.room)
    if (allUserInSameRoom.length === 0) {
      console.log('Close ChatLogger for room: ', user.room)
      chatLogger[user.room].end()
      chatLogger[user.room].close()
      chatLogger[user.room] = null
    }
  }

  socket.on('disJoin', (options, callback) => {
    console.log('Disjoin User: ', options.userId)
    removeChatUser(options.userId, callback)
  })


  socket.on('disconnectChat', (userId) => {
    console.log('DisconnectChat for User: ', userId)
    removeChatUser(userId)
  })

  socket.on('disconnect', () => {
    console.log('Disconnect WebSocket id:', socket.id)
  })
})


// Router for ChatLogger and Online Users
app.get('/chatLogger/:key', (req, res) => {
  if (req.params.key === keys.authSecretKey) {
    res.send(chatLogger)
    return
  }
  res.status(404).send()
})

app.delete('/chatLogger/:key', (req, res) => {
  if (req.params.key === keys.authSecretKey) {
    chatLogger = {}
    res.send('done')
    return
  }
  res.status(404).send()
})

app.get('/online/users/:key', (req, res) => {
  if (req.params.key === keys.authSecretKey) {
    res.send(getAllUsers())
    return
  }
  res.status(404).send()
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})
