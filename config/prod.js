// All production related keys --- Commit to git, So that heroku can use it
module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  authSecretKey: process.env.AUTH_SECRET_KEY
}