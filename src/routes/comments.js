const express = require('express')

const CommentsController = require('../controllers/comments/commentsController')

const {
  validateCreateComment,
  validateDeleteComment,
  validateUpdateComment,
  validateGetRepliedComments
} = require('../controllers/comments/validators')

const { requireAuth } = require('../middlewares')

const routes  = express.Router()

routes.post('/', requireAuth, validateCreateComment, CommentsController.createComment)
routes.delete('/:id?', requireAuth, validateDeleteComment, CommentsController.deleteComment)
routes.put('/:id?', requireAuth, validateUpdateComment, CommentsController.updateComment)
routes.get('/:id?', validateGetRepliedComments, CommentsController.getRepliedComments)

module.exports = routes