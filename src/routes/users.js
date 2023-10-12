const express = require('express')

const UsersController = require('../controllers/users/usersController')

const {
  validateCreateUser,
  validateDeleteUser,
  validateGetUser,
  validateGetUserPosts,
  validateUpdateUser
} = require('../controllers/users/validators')

const { requireAuth } = require('../middlewares')

const routes  = express.Router()

routes.post('/', validateCreateUser, requireAuth, UsersController.createUserAdmin)
routes.put('/:id?', validateUpdateUser, requireAuth, UsersController.updateUser)
routes.delete('/:id?', validateDeleteUser, requireAuth, UsersController.deleteUser)
routes.get('/:id/posts', validateGetUserPosts, UsersController.getUserPosts)
routes.get('/:id?', validateGetUser, requireAuth, UsersController.getUser)

module.exports = routes