const express = require('express')

const FollowsController = require('../controllers/follows/followsController')

const {
  validateCreateFollow,
  validateDeleteFollow
} = require('../controllers/follows/validators')

const { requireAuth } = require('../middlewares')

const routes  = express.Router()

routes.post('/:id?', requireAuth, validateCreateFollow, FollowsController.createFollow)
routes.delete('/:id?', requireAuth, validateDeleteFollow, FollowsController.deleteFollow)

module.exports = routes