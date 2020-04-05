const multer = require('multer')
const sharp = require('sharp')
const ChatGroup = require('../models/chatgroup')
const auth = require('../middleware/auth')

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
      const foundUserInGroup = groupLinks.find((grp) => grp.refId === req.user._id)

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
      res.status(400).send(e)
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

  router.post('/chatGroups/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
      const chatGrp = await ChatGroup.findById(req.params.id)
      if (!chatGrp) {
        throw new Error('Invalid Group')
      }

      // Check if current group has current user
      const groupLinks = chatGrp.members || []
      const foundUserInGroup = groupLinks.find((grp) => grp.refId === req.user._id)

      if (foundUserInGroup) {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
      } else {
        throw new Error('Invalid user access to Chat Group')
      }
      res.status(200).send()
    } catch (e) {
      res.status(400).send(e)
    }
  }, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
  })
}