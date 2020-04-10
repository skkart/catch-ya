const User = require('../models/user')
const auth = require('../middleware/auth')

module.exports = (router) => {
  router.post('/auth/login', async (req, res) => {
    try {
      console.log('Login')
      const user = await User.findByCredentials(req.body.email, req.body.password)
      await user.generateAuthToken() // Generate new token of every login
      const { token } = user.tokens[0]
      console.log('token: ', token)
      res.send({ user, token })
    } catch (e) {
      console.log(e)
      res.status(400).send(e)
    }
  })

  router.post('/auth/logout', auth, async (req, res) => {
    try {
      // Remove the generated token of every logout
      req.user.tokens = req.user.tokens.filter((tk) => tk.token !== req.token)
      await req.user.save()

      res.send()
    } catch (e) {
      res.status(500).send()
    }
  })

  router.post('/auth/logoutAll', auth, async (req, res) => {
    try {
      req.user.tokens = []
      await req.user.save()
      res.send()
    } catch (e) {
      res.status(500).send()
    }
  })
}