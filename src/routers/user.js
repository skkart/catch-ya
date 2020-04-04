const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')

const router = new express.Router()


router.post('/auth/login', async (req, res) => {
  try {
    console.log('Login')
    const user = await User.findByCredentials(req.body.email, req.body.password)
    // const token = await user.generateAuthToken() // Generate new token of every login
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
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
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


router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    // sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})


router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

router.get('/users/connections', auth, async (req, res) => {
  let userList = []
  try {
    userList = await User.find({ _id: { $ne: req.user._id } })
  } catch (e) {
    console.log('Error ', e)
  }
  res.send(userList)
})

router.get('/users/search/:namePattern', async (req, res) => {
  const namePattern = req.params.namePattern || 'test'
  let userList = []
  try {
    const regex = new RegExp(namePattern, 'i')
    userList = await User.find({ $or: [{ name: regex }, { email: regex }] })
  } catch (e) {
    console.log('Error ', e)
  }
  res.send(userList)
})

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
    updates.forEach((update) => { req.user[update] = req.body[update] })
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    // sendCancelationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/me/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})

module.exports = router