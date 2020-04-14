const express = require('express')
const path = require('path')

const http = require('http')
const socketio = require('socket.io')
const fs = require('fs')

require('./db/mongoose')

const app = express()

const port = process.env.PORT || 5000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
// app.use('/resources', express.static(__dirname, '../public/img'))

app.use(express.json())
require('./routers/auth')(app)
require('./routers/user')(app)
require('./routers/chatGroups')(app)


const server = http.createServer(app)
const io = socketio(server)
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
  addUser, removeUser, getUser, getUsersInRoom,
} = require('./utils/users')

const chatDirectoryPath = path.join(__dirname, '../chatlogs')

const chatLogger = {}
const openWriterStream = (writerId) => {
  const chatPath = path.join(chatDirectoryPath, writerId)
  chatLogger[writerId] = fs.createWriteStream(chatPath, {
    flags: 'a+' // 'a' means appending (old data will be preserved)
  })
  return chatLogger[writerId]
}

io.on('connection', (socket) => {
  console.log('New WebSocket connection id', socket.id)

  socket.on('join', (options, callback) => {
    console.log('Join', options.userId)
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
    console.log('sendMessage', userId)
    // const user = getUser(userId)
    // const { room, username } = user
    // if (!user) {
    //   console.log('User Not found')
    //   return
    // }
    io.to(room).emit('message', generateMessage(username, message, room, chatLogger[room]))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    console.log('sendLocation', coords.userId)
    const user = getUser(coords.userId)
    if (!user) {
      console.log('User Not found')
      return
    }
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  socket.on('disJoin', (options, callback) => {
    console.log('disJoin', options.userId)
    const user = removeUser(options.userId)
    if (!user) {
      console.log('User Not found')
      return callback('User not found')
    }


    // Close the chatLogger only if all the users are disJoined
    const allUserInSameRoom = getUsersInRoom(user.room)
    if (allUserInSameRoom.length === 0) {
      console.log('Close chatLogger')
      chatLogger[user.room].end()
      chatLogger[user.room].close()
      chatLogger[user.room] = null
    }
  })

  socket.on('disconnectChat', (userId) => {
    console.log('disconnectChat', userId)
    const user = removeUser(userId)

    if (!user) {
      console.log('User Not found')
      return
    }

    // Close the chatLogger only if all the users are disJoined
    const allUserInSameRoom = getUsersInRoom(user.room)
    if (allUserInSameRoom.length === 0) {
      console.log('Close chatLogger')
      chatLogger[user.room].end()
      chatLogger[user.room].close()
      chatLogger[user.room] = null
    }
  })

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id)
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})
