const express = require('express')

const LikesController = require('../controllers/likes/likesController')

const {
  validateCreateLike,
  validateDeleteLike,
} = require('../controllers/likes/validators')

const { requireAuth } = require('../middlewares')

const routes  = express.Router()

routes.post('/post/:id?', requireAuth, validateCreateLike, LikesController.createPostLike)
routes.delete('/post/:id?', requireAuth, validateDeleteLike, LikesController.deletePostLike)
routes.post('/comment/:id?', requireAuth, validateCreateLike, LikesController.createCommentLike)
routes.delete('/comment/:id?', requireAuth, validateDeleteLike, LikesController.deleteCommentLike)

module.exports = routes