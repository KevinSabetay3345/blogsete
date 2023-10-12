const mongoose = require('mongoose')

const LikeSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    comment_id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
  }
)

module.exports = mongoose.model('Like', LikeSchema)