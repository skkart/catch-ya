const generateMessage = (username, text, room, userId, hasSameNames, chatLoggerDb) => {
  const dt = {
    username,
    text,
    createdAt: new Date().getTime()
  }
  if (hasSameNames) {
    dt.userId = userId
  }
  if (chatLoggerDb) {
    // chatLogger.write(`${JSON.stringify(dt)},`)
    chatLoggerDb.logs.push(dt)
  }
  dt.room = room
  return dt
}

const generateLocationMessage = (username, url) => ({
  username,
  url,
  createdAt: new Date().getTime()
})

module.exports = {
  generateMessage,
  generateLocationMessage
}