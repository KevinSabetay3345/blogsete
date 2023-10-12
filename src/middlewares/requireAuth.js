const mongoose = require('mongoose')
const { verifyToken } = require('../utils/auth')

const requireAuth = async(req, res, next) => {
  try {
    const token = req.headers.authorization.trim()
    const tokenData = await verifyToken(token)
    
    if (!mongoose.Types.ObjectId.isValid(tokenData.data._id)) {
      throw { status: 422, message: 'ID_MALFORMED' }
    }
    
    req.user = tokenData.data
    return next()
  } catch (error) {
    if (!error.status) {
      error = { status: 401, message: error.message }
    }
    return res.status(error.status).json({ msg: error.message })
  }
}

module.exports = { requireAuth }