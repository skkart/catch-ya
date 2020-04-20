const sharp = require('sharp')
const User = require('../models/user')
const ChatGroup = require('../models/chatgroup')
const auth = require('../middleware/auth')
const { upload } = require('../utils/general')
const { getAllUsersIds } = require('../utils/users')

module.exports = (router) => {
  router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
      if (!user.about) {
        user.about = 'Catch Me anytime !!!'
      }
      const avatarBuffer = await user.generateAvatar()
      if (avatarBuffer) {
        user.avatar = avatarBuffer
      }
      await user.save()
      // sendWelcomeEmail(user.email, user.name)
      const token = await user.generateAuthToken()
      res.status(201).send({ user, token })
    } catch (e) {
      console.error('Error on user save', e)
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
      console.error('Error ', e)
    }
    res.send(userList)
  })

  router.get('/users/online', auth, async (req, res) => {
    const allActiveUsersGlobal = getAllUsersIds()
    const allActiveFrds = []
    req.user && req.user.chatlinks.forEach((link) => {
      if (link.refType === 'user' && allActiveUsersGlobal.indexOf(link.refId.toString()) > -1) {
        allActiveFrds.push(link.refId)
      }
    })
    res.send(allActiveFrds)
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
        const allActiveUsers = getAllUsersIds()
        userList = userList.map(({
          avatar, name, about, _id, email, gender 
        }) => {
          let status = ''
          if (allActiveUsers.indexOf(_id.toString()) > -1) {
            status = 'online'
          } else {
            status = 'offline'
          }
          return {
            name,
            about,
            _id,
            email,
            gender,
            avatar: Buffer.from(avatar).toString('base64'),
            status
          }
        })
      }

      if (chatGroupIds.length) {
        groupList = await ChatGroup.find({ _id: { [mongoCondition]: chatGroupIds } })
      } else if (mongoCondition === '$nin') {
        // In case of not in condition, and not group Length --- Fetch all groups
        groupList = await ChatGroup.find({})
      }
    } catch (e) {
      console.error('Error ', e)
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
      console.error(e)
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
      console.error('Error ', e)
    }
    res.send(userList)
  })

  router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'gender', 'about']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      console.error('Invalid Updates!!!')
      return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
      updates.forEach((update) => {
        req.user[update] = req.body[update]
      })
      await req.user.save()
      res.send(req.user)
    } catch (e) {
      console.error(e)
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

  router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
      req.user.avatar = buffer
      await req.user.save()
      res.send(buffer)
    } catch (e) {
      console.error('Error on avatar upload', e)
      res.status(400).send({ error: e })
    }
  }, (error, req, res, next) => {
    console.error('Error on avatar upload', error.message)
    res.status(400).send({ error: error.message })
  })

  router.post('/users/:id/avatar', upload.single('avatar'), async (req, res) => {
    const userObj = await User.findById(req.params.id)
    if (!userObj) {
      throw new Error('Invalid User')
    }
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    userObj.avatar = buffer
    await userObj.save()
    res.send()
  }, (error, req, res, next) => {
    console.error(error.message)
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
      console.error(e)
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
      console.error(e)
      res.status(404).send()
    }
  })
}