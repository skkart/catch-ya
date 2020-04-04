const proxy = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(proxy(['/auth/', '/users', '/img/'], { target: 'http://localhost:5000' }))

  app.use(proxy('/socket.io', { target: 'http://localhost:5000', ws: true }))
}