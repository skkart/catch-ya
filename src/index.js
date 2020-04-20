const express = require('express')
const path = require('path')

const http = require('http')
const socketio = require('socket.io')
const fs = require('fs')
const keys = require('../config/keys')

const {getChatLogger} = require('./utils/general')

const isProd = (process.env.NODE_ENV === 'production')

require('./db/mongoose')

const app = express()

const port = process.env.PORT || 5000


const publicDirectoryPath = isProd ? path.join(__dirname, '../client/build') : path.join(__dirname, '../public')

// Express will serve up assets , static folder and index.html (UI)
app.use(express.static(publicDirectoryPath))

app.use(express.json())

require('./routers/auth')(app)
require('./routers/user')(app)
require('./routers/chatGroups')(app)

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


let chatLoggerDb = {}

io.on('connection', (socket) => {
  console.log('Connect WebSocket id:', socket.id)

  socket.on('join', async (options, callback) => {
    console.log(`New Join Request user: ${options.userId} , room: ${options.room}`)
    const { error, user } = addUser({ id: options.userId, ...options })

    if (error || !user) {
      console.log('Error', (error || 'user not found'))
      return callback(error || 'user not found')
    }

    // Tell the current socket to join specific room
    socket.join(user.room)

    if (!chatLoggerDb[user.room]) {
      chatLoggerDb[user.room] = await getChatLogger(user.room)
    }

    console.log(`Emit RoomData user: ${user.id} , room: ${user.room}`)
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
      chatLogs: chatLoggerDb[user.room] ? chatLoggerDb[user.room].logs : []
    })
    // This callback will inform UI that all is well
    callback()
    // This emit will send only to its connection
    // socket.emit('message', generateMessage('Admin', 'Welcome!'))
    // This broadcast.to will send all scokets belong to that room apart current connection
    // socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
    // This io.to will send all scokets belong to that room + current connection
  })

  socket.on('active', (userId) => {
    console.log('online', userId)
    socket.broadcast.emit('online', userId)
  })

  socket.on('unactive', (userId) => {
    console.log('offline', userId)
    socket.broadcast.emit('offline', userId)
  })

  socket.on('keepAlive', (callback) => {
    console.log('keepAlive', socket.id)
  })

  socket.on('sendMessage', ({
    userId, message, room, username
  }, callback) => {
    console.log(`Send Message user: ${userId} , room: ${room}`)
    io.to(room).emit('message', generateMessage(username, message, room, chatLoggerDb[room]))
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

  const removeChatUser = async (userId, callback) => {
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
      // flush all the stored chatlogs to mongodb
      if (chatLoggerDb[user.room]) {
        await chatLoggerDb[user.room].save()
        chatLoggerDb[user.room] = null
      }
    }
    callback && callback()
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
    res.send(chatLoggerDb)
    return
  }
  res.status(404).send()
})

app.delete('/chatLogger/:key', (req, res) => {
  if (req.params.key === keys.authSecretKey) {
    chatLoggerDb = {}
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

if (isProd) {
// Express will serve index.html for rest of unknown routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(publicDirectoryPath, 'index.html'))
  })
}


server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})
