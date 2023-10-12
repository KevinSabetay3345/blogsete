const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')

const validateUpdateUser = [
  check('id')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim()
    .isMongoId()
    .withMessage('ID_MALFORMED'),
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
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateUpdateUser }
