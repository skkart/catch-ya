const generateMessage = (username, text, room, chatLogger) => {
  const dt = {
    username,
    text,
    createdAt: new Date().getTime()
  }
  if (chatLogger) {
    chatLogger.write(`${JSON.stringify(dt)},`)
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