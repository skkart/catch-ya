const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const path = require('path')
const sharp = require('sharp')
const { Schema } = mongoose
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!emailRegex.test(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"')
      }
    }
  },
  gender: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      const val = value.toLowerCase()
      if (['male', 'female'].indexOf(val) === -1) {
        throw new Error('Invalid Gender')
      }
    }
  },
  about: {
    type: String,
    required: false,
    trim: true,
    default: 'Catch Me anytime !!!'
  },
  chatlinks: [{
    refId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    refType: {
      type: String,
      required: true
    }
  }],
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
} )

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  // delete userObject.avatar

  return userObject
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, keys.jwtSecretKey, { expiresIn: '365 days' })

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

userSchema.methods.generateAvatar = async function () {
  const user = this
  let imgBuffer = null
  if (!user.avatar) {
    const imageLoc = path.join(__dirname, '../../public/img')
    imgBuffer = await sharp(path.join(imageLoc, `${user.gender}.png`)).resize({ width: 250, height: 250 }).png().toBuffer()
  }
  return imgBuffer
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

userSchema.statics.findByCredentials = async (email, password) => {
  const UserCollection = mongoose.model('User')
  const user = await UserCollection.findOne({ email })

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

const User = mongoose.model('User', userSchema)

module.exports = User