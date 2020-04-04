// Figure out what set of keys to return based on NODE_ENV

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./prod')
} else {
  // we are in dev, use dev keys
  module.exports = require('./dev')
}