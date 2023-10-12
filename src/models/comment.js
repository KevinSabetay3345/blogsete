const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    repliedComment: {
      type: mongoose.Schema.Types.ObjectId,
    },
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    deleted: {
      type: Boolean,
      default: false
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
  }
)

module.exports = mongoose.model('Comment', CommentSchema)