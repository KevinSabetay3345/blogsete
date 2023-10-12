const { validateResult } = require('../../../middlewares')
const { check } = require('express-validator')
const { genSortObject } = require('../../../utils')
const config = require('../../../config')

const validateGetPostLikes = [
  check('id')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY')
    .trim()
    .isMongoId()
    .withMessage('ID_MALFORMED'),
  check('limit')
    .optional()
    .trim()
    .isInt({ min: 1, max: config.pagination.maxLimit })
    .withMessage("INVALID_NUMBER"),
  check('skip')
    .optional()
    .trim()
    .isInt({ min: 0, max: config.pagination.maxSkip })
    .withMessage("INVALID_NUMBER"),
  check('sortBy')
    .optional()
    .customSanitizer(value => genSortObject(value)),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateGetPostLikes }
