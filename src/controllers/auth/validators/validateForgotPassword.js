const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')

const validateForgotPassword = [
  check('email')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim()
    .isEmail()
    .withMessage('EMAIL_IS_NOT_VALID')
    .normalizeEmail(),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateForgotPassword }
