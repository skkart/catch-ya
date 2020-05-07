const sharp = require('sharp')
const ChatGroup = require('../models/chatgroup')
const auth = require('../middleware/auth')
const { upload } = require('../utils/general')
const { getAllUsers } = require('../utils/users')

const User = require('../models/user')

module.exports = (router) => {
  router.post('/chatGroups', auth, async (req, res) => {
    try {
      const chatGrp = new ChatGroup(req.body)
      const avatarBuffer = await chatGrp.generateAvatar()
      if (avatarBuffer) {
        chatGrp.avatar = avatarBuffer
      }

      // Create current user as member and isAdmin
      chatGrp.members = [{
        refId: req.user._id,
        isAdmin: true
      }]

      const savedChatGrp = await chatGrp.save()

      req.user.chatlinks = req.user.chatlinks || []

      // For chatgroup, save the group in user chatlinks
      req.user.chatlinks.push({
        refType: 'chatgroup',
        refId: savedChatGrp._id
      })

      await req.user.save()
      res.status(201).send(savedChatGrp)
    } catch (e) {
      console.error(e)
      res.status(400).send(e)
    }
  })


  router.post('/chatGroups/user/add/:id', auth, async (req, res) => {
    try {
      const chatGrp = await ChatGroup.findById(req.params.id)
      if (!chatGrp) {
        throw new Error('Invalid Group')
      }

      // Check if current group has current user
      const groupLinks = chatGrp.members || []
      const foundUserInGroup = groupLinks.find((grp) => grp.refId.toString() === req.user._id.toString())

      if (foundUserInGroup) {
        throw new Error('User for this Chat Group already exists')
      } else {
        // Add this user in chatGrp
        chatGrp.members.push({
          refId: req.user._id
        })

        const savedChatGrp = await chatGrp.save()

        // For chatgroup, save the group in user chatlinks
        req.user.chatlinks = req.user.chatlinks || []

        // For chatgroup, save the group in user chatlinks
        req.user.chatlinks.push({
          refType: 'chatgroup',
          refId: savedChatGrp._id
        })

        await req.user.save()
      }

      res.status(201).send(req.user)
    } catch (e) {
      console.error(e)
      res.status(400).send(e)
    }
  })


  router.post('/chatGroups/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
      const chatGrp = await ChatGroup.findById(req.params.id)
      if (!chatGrp) {
        throw new Error('Invalid Group')
      }

      // Check if current group has current user
      const groupLinks = chatGrp.members || []

      const foundUserInGroup = groupLinks.find((grp) => (grp.refId.toString() === req.user._id.toString()))
      if (foundUserInGroup) {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        chatGrp.avatar = buffer
        await chatGrp.save()
      } else {
        throw new Error('Invalid user access to Chat Group')
      }
      res.status(200).send()
    } catch (e) {
      console.error(e)
      res.status(400).send(e)
    }
  }, (error, req, res, next) => {
    console.error(error.message)
    res.status(400).send({ error: error.message })
  })


  const getAllParticipantsOfGroup = async (userIds) => {
    let userList = []
    try {
      console.log('userList', userIds)
      if (userIds.length) {
        userList = await User.find({ _id: { $in: userIds } })
        const allUsersGlobal = getAllUsers()
        userList = userList.map(({
          avatar, name, about, _id, email, gender
        }) => {
          let status = ''
          const user = allUsersGlobal[_id.toString()]
          if (user) {
            status = user.isActive ? 'online' : 'away'
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
    } catch (e) {
      console.error('Error ', e)
    }
    return userList
  }

  router.get('/chatGroups/:id/participants', auth, async (req, res) => {
    let list = []
    try {
      const chatGrp = await ChatGroup.findById(req.params.id)
      if (!chatGrp) {
        throw new Error('Invalid Group')
      }

      // Check if current group has current user
      const groupLinks = chatGrp.members || []
      list = await getAllParticipantsOfGroup(groupLinks.map(grp => grp.refId))
    } catch (e) {
      console.error(e)
      res.status(400).send(e)
    }
    res.send(list)
  })
}