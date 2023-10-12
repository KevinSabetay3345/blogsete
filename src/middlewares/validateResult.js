const { validationResult } = require('express-validator')

const validateResult = (req, res, next) => {
  try {
    validationResult(req).throw()
    return next()
  } catch (err) {
    return res.status(400).json({ msg: err.array() })
  }
}

module.exports = { validateResult }