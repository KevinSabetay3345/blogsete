const mongoose = require('mongoose')

const FollowSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
  }
)

module.exports = mongoose.model('Follow', FollowSchema)