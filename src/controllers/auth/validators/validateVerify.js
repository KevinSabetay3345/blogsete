const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')

const validateVerify = [
  check('verification')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isString()
    .withMessage('IS_NOT_STRING')
    .trim(),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateVerify }
