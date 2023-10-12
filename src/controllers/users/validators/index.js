const { validateCreateUser } = require('./validateCreateUser')
const { validateDeleteUser } = require('./validateDeleteUser')
const { validateGetUser } = require('./validateGetUser')
const { validateGetUserPosts } = require('./validateGetUserPosts')
const { validateUpdateUser } = require('./validateUpdateUser')

module.exports = {
  validateCreateUser,
  validateDeleteUser,
  validateGetUser,
  validateGetUserPosts,
  validateUpdateUser
}
