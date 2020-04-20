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
  const user = users[id]

  if (!user) {
    delete users[id]
    return user
  }
}

const getUser = (id) => users.find((user) => user.id.toString() === id.toString())

const getUserBySocketId = (socketId) => users.find((user) => user.socketId === socketId)


const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  return users.filter((user) => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserBySocketId,
  getUsersInRoom,
  getAllUsers: () => users,
  getActiveUsersIds: () => {
    const activeUsrId = []
    users.forEach(usr => usr.isActive && (activeUsrId.push(usr.id)))
    return activeUsrId
  }
}
