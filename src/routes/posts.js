const express = require('express')

const PostsController = require('../controllers/posts/postsController')

const {
  validateCreatePost,
  validateUpdatePost,
  validateDeletePost,
  validateGetPost,
  validateGetPostComments,
  validateGetPostLikes
} = require('../controllers/posts/validators')

const { requireAuth } = require('../middlewares')

const routes  = express.Router()

routes.post('/', requireAuth, validateCreatePost, PostsController.createPost)
routes.put('/:id?', requireAuth, validateUpdatePost, PostsController.updatePost)
routes.delete('/:id?', requireAuth, validateDeletePost, PostsController.deletePost)
routes.get('/:id/likes', validateGetPostLikes, PostsController.getPostLikes)
routes.get('/:id/comments', validateGetPostComments, PostsController.getPostComments)
routes.get('/:id?', validateGetPost, PostsController.getPost)

module.exports = routes