const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')

const validateCreatePost = [
  check('assets')
    .exists()
    .withMessage('MISSING')
    .isArray({ min: 1, max: 10 })
    .withMessage('ASSETS_MIN_1_MAX_10'),
  check('assets.*.url')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim()
    .isURL()
    .withMessage('INVALID_URL'),
  check('assets.*.type')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim()
    .isIn(['text', 'image', 'video'])
    .withMessage('INVALID_TYPE'),
  check('description')
    .optional()
    .isString()
    .withMessage('IS_NOT_STRING')
    .trim(),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateCreatePost }
