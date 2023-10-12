const express = require('express')

const AuthController = require('../controllers/auth/authController')

const {
  validateRegister,
  validateVerify,
  validateForgotPassword,
  validateResetPassword,
  validateLogin
} = require('../controllers/auth/validators')

const { requireAuth } = require('../middlewares')

const routes = express.Router()

routes.post('/register', validateRegister, AuthController.register)
routes.post('/verify', validateVerify, AuthController.verifyUser)
routes.post('/login', validateLogin, AuthController.login)
routes.post('/forgot', validateForgotPassword, AuthController.forgotPassword)
routes.post('/reset', validateResetPassword, AuthController.resetPassword)
routes.post('/token', requireAuth, AuthController.refreshToken)

module.exports = routes
