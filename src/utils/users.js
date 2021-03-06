
const users = {}

const addUser = ({ id, username, room, socketId }) => {
  // Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required!',
    }
  }

  // Check for existing user
  let user = users[id]

  // Validate username
  if (!user) {
    user = { id, username, room, socketId }
    // Store user
    users[id] = user
  } else {
    user.room = room
    user.socketId = socketId
  }

  return { user }
}

const removeUser = (id) => {
  if (users[id]) {
    users[id].id = null
    users[id].username = null
    users[id].room = null
    delete users[id]
    return true
  }
  return false
}

const getUser = (id) => users[id]

const getUserBySocketId = (socketId) => {
  for (const usr of Object.keys(users)) {
    if (users[usr].socketId === socketId) {
      return users[usr]
    }
  }
}

const getUsersInRoom = (room) => {
  const sameRoomUsers = []
  for (const usr of Object.keys(users)) {
    if (users[usr].room === room) {
      sameRoomUsers.push(users[usr])
    }
  }
  return sameRoomUsers
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserBySocketId,
  getUsersInRoom,
  getAllUsers: () => users,
}
