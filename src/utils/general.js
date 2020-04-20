const multer = require('multer')
const Chatlogs = require('../models/chatlogs')


const upload = multer({
  limits: {
    fileSize: 2e+7
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  }
})


const getChatLogger = async (chatRefId) => {
  let chatlogs = null
  try {
    // Check if chatlog entry is found in DB, If not create one
    chatlogs = await Chatlogs.findOne({ chatRefId }, 0)

    if (!chatlogs) {
      chatlogs = new Chatlogs({ chatRefId })
      chatlogs = await chatlogs.save()
    }
  } catch (e) {
    console.error(e)
    chatlogs = null
  }
  return chatlogs
}

module.exports = {
  upload,
  getChatLogger
}