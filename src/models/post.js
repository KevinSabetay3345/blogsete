const mongoose = require('mongoose')
const validator = require('validator')

const PostSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    description: {
      type: String,
    },
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    assets: [
      {
        url: {
          type: String,
          validate: {
            validator(v) {
              return v === '' ? true : validator.isURL(v)
            },
            message: 'NOT_A_VALID_URL'
          },
          lowercase: true
        },
        type: {
          type: String,
          enum: ['text', 'image', 'video']
        }
      }
    ]
  },
  {
    versionKey: false,
    timestamps: true
  }
)

module.exports = mongoose.model('Post', PostSchema)