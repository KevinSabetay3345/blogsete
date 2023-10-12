/**
 * Gets browser info from user
 * @param {*} req - request object
 * @returns {string} browser info
 */
const getBrowserInfo = ({ headers }) => headers['user-agent']

module.exports = { getBrowserInfo }
