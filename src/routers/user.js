const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const ChatGroup = require('../models/chatgroup')
const auth = require('../middleware/auth')

module.exports = (router) => {
  router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
      const avatarBuffer = await user.generateAvatar()
      if (avatarBuffer) {
        user.avatar = avatarBuffer
      }
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

  // Get all the users in DB except this user
  router.get('/users/connections/all', auth, async (req, res) => {
    let userList = []
    try {
      userList = await User.find({ _id: { $ne: req.user._id } })
    } catch (e) {
      console.log('Error ', e)
    }
    res.send(userList)
  })

  const getUserConnectionsByCondtion = async (req, mongoCondition) => {
    let userList = []
    let groupList = []
    try {
      const userIds = []
      const chatGroupIds = []
      req.user.chatlinks.forEach((link) => {
        if (link.refType === 'user') {
          userIds.push(link.refId)
        } else if (link.refType === 'chatgroup') {
          chatGroupIds.push(link.refId)
        }
      })

      // In case of not in condition, add current user id to ignore it
      if (mongoCondition === '$nin') {
        userIds.push(req.user._id)
      }


      if (userIds.length) {
        userList = await User.find({ _id: { [mongoCondition]: userIds } })
      }

      if (chatGroupIds.length) {
        groupList = await ChatGroup.find({ _id: { [mongoCondition]: chatGroupIds } })
      } else if (mongoCondition === '$nin') {
        // In case of not in condition, and not group Length --- Fetch all groups
        groupList = await ChatGroup.find({})
      }
    } catch (e) {
      console.log('Error ', e)
    }
    return [...userList, ...groupList]
  }

  // Get all the users and groups which are not associated this user
  router.get('/users/connections/rest', auth, async (req, res) => {
    const list = await getUserConnectionsByCondtion(req, '$nin')
    res.send(list)
  })

  // Get all the users and groups which is linked this user
  router.get('/users/connections', auth, async (req, res) => {
    const list = await getUserConnectionsByCondtion(req, '$in')
    res.send(list)
  })

  // Add user or group for this user
  router.post('/users/connections/add', auth, async (req, res) => {
    const chatLink = req.body

    try {
      if (chatLink.refId && chatLink.refType) {
        // If its User, save the same in other user too
        if (chatLink.refType === 'user') {
          const otherUser = await User.findById(chatLink.refId)

          if (!otherUser) {
            throw new Error('Other user not found')
          }

          otherUser.chatlinks = otherUser.chatlinks || []
          otherUser.chatlinks.push({
            refType: 'user',
            refId: req.user._id
          })

          await otherUser.save()
        } else if (chatLink.refType === 'chatgroup') {
          const chatGrp = await ChatGroup.findById(chatLink.refId)
          if (!chatGrp) {
            throw new Error('Invalid Group')
          }

          // Add this user in chatGrp
          chatGrp.members.push({
            refId: req.user._id
          })

          await chatGrp.save()
        }

        req.user.chatlinks = req.user.chatlinks || []
        req.user.chatlinks.push(chatLink)

        await req.user.save()

        res.status(201).send(req.user)
      } else {
        throw new Error('Passed invalid options')
      }
    } catch (e) {
      res.status(400).send(e)
    }
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
      updates.forEach((update) => {
        req.user[update] = req.body[update]
      })
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
}