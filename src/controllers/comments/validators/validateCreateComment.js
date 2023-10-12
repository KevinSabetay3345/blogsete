const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')

const validateCreateComment = [
  check('message')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .isString()
    .withMessage('IS_NOT_STRING')
    .trim(),
  check('post_id')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim()
    .isMongoId()
    .withMessage('ID_MALFORMED'),
  check('repliedComment')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('ID_MALFORMED'),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateCreateComment }
