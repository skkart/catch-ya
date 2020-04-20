const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  chatRefId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  logs: [{
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: { type: Date, default: Date.now }
  }],
})

chatSchema.methods.toJSON = function () {
  return this.toObject()
}

const chatlogs = mongoose.model('chatlogs', chatSchema)

module.exports = chatlogs