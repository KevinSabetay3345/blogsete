const express = require('express')

const routes  = express.Router()

routes.use('/', require('./auth'))
routes.use('/users', require('./users'))
routes.use('/follows', require('./follows'))
routes.use('/posts', require('./posts'))
routes.use('/likes', require('./likes'))
routes.use('/comments', require('./comments'))

routes.get('/', (_, res) => {
  res.status(200).json({ message: 'Ok' })
})

routes.use(function(_, res) {
  res.status(404).json({ message: 'Route not found' })
})

module.exports = routes
