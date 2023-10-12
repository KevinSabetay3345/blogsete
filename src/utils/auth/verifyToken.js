const jwt = require('jsonwebtoken')
const config = require('../../config')

/**
 * Verifies token
 * @param {string} token - token to verify
 * @returns {*} decoded data or error
 */
const verifyToken = async (token = '') => {
    return jwt.verify(token, config.jwt.privateKey, function(err, decoded) {
      if (err) throw err
      return decoded
    })
}

module.exports = { verifyToken }
