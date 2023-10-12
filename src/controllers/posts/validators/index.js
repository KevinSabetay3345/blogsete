const { validateCreatePost } = require('./validateCreatePost')
const { validateDeletePost } = require('./validateDeletePost')
const { validateGetPost } = require('./validateGetPost')
const { validateGetPostComments } = require('./validateGetPostComments')
const { validateGetPostLikes } = require('./validateGetPostLikes')
const { validateUpdatePost } = require('./validateUpdatePost')

module.exports = {
  validateCreatePost,
  validateDeletePost,
  validateGetPostComments,
  validateGetPostLikes,
  validateGetPost,
  validateUpdatePost
}
