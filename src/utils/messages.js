const generateMessage = (username, text, chatLogger) => {
  const dt = {
    username,
    text,
    createdAt: new Date().getTime()
  }
  if (chatLogger) {
    chatLogger.write(`${JSON.stringify(dt)},`)
  }
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