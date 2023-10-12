const requestIp = require('request-ip')

/**
 * Gets IP from user
 * @param {*} req - request object
 * @returns {string} IP
 */
const getIP = (req) => requestIp.getClientIp(req)

module.exports = { getIP }
