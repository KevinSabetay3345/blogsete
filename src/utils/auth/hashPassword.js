const bcrypt = require('bcrypt')
const config = require('../../config')

/**
 * Hashes password
 * @param {string} password - password to hash
 * @returns {*} password hash or error
 */
const hashPassword = async (password = '') => {
    try {
        const salt = await bcrypt.genSalt(config.auth.saltRounds)
        const hash = await bcrypt.hash(password, salt)
        return hash
    } catch (error) {
        return { error }
    }
}

module.exports = { hashPassword }