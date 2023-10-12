const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')

const validateResetPassword = [
  check('verification')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isString()
    .withMessage('IS_NOT_STRING')
    .trim(),
  check('newPassword')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isString()
    .withMessage('IS_NOT_STRING')
    .trim()
    .isLength({
      min: 6
    })
    .withMessage('PASSWORD_TOO_SHORT_MIN_6'),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateResetPassword }
