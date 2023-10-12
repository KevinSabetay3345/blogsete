const { validateCreateComment } = require('./validateCreateComment')
const { validateDeleteComment } = require('./validateDeleteComment')
const { validateUpdateComment } = require('./validateUpdateComment')
const { validateGetRepliedComments } = require('./validateGetRepliedComments')

module.exports = {
  validateCreateComment,
  validateDeleteComment,
  validateUpdateComment,
  validateGetRepliedComments
}
