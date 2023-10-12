const jwt = require('jsonwebtoken')
const config = require('../../config')

/**
 * Generates token
 * @param {string} user - user id
 * @param {string} role - user role
 * @returns {string} token
 */
const generateToken = (user = '', role = '') => {
  return jwt.sign(
    {
      data: {
        _id: user,
        role
      }
    },
    config.jwt.privateKey,
    {
      expiresIn: config.jwt.tokenExpireInSeconds
    }
  )
}

module.exports = { generateToken }
