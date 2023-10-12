const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')

const validateCreateUser = [
  check('name')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isString()
    .withMessage('IS_NOT_STRING')
    .trim(),
  check('email')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim()
    .isEmail()
    .withMessage('EMAIL_IS_NOT_VALID')
    .normalizeEmail(),
  check('password')
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

module.exports = { validateCreateUser }
