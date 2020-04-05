const mongoose = require('mongoose')
const path = require('path')
const sharp = require('sharp')

const { Schema } = mongoose


const chatGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  about: {
    type: String,
    required: false,
    trim: true,
    default: 'Group Chat anytime !!!'
  },
  members: [{
    refId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
})

chatGroupSchema.methods.toJSON = function () {
  const chatGroup = this
  const chatGroupObj = chatGroup.toObject()

  return chatGroupObj
}

chatGroupSchema.methods.generateAvatar = async function () {
  const user = this
  let imgBuffer = null
  if (!user.avatar) {
    const imageLoc = path.join(__dirname, '../../public/img/chatgroup.png')
    imgBuffer = await sharp(imageLoc).resize({ width: 250, height: 250 }).png().toBuffer()
  }
  return imgBuffer
}


const ChatGroup = mongoose.model('ChatGroup', chatGroupSchema)

module.exports = ChatGroup