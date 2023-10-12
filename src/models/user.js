const mongoose = require('mongoose')
const validator = require('validator')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: 'EMAIL_IS_NOT_VALID'
      },
      lowercase: true,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    verification: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    blockExpires: {
      type: Date,
      default: new Date()
    },
    followers: {
      type: Number,
      default: 0
    },
    followings: {
      type: Number,
      default: 0
    },
    postsCount: {
      type: Number,
      default: 0
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

module.exports = mongoose.model('User', UserSchema)