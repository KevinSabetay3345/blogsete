const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')

const validateDeletePost = [
  check('id')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim()
    .isMongoId()
    .withMessage('ID_MALFORMED'),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateDeletePost }
