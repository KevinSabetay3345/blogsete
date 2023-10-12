/**
 * Generates sort object for mongo search
 * @param {string} sort
 * @returns {object} sort object
 */
const genSortObject = (sort = '') => {
  if (sort === '') return {}

  let sortObject = {}

  sort.trim().split(',').map(v => {
    if (v[0] === '-') {
      sortObject[v.substring(1)] = -1
    } else {
      sortObject[v] = 1
    }
  })

  return sortObject
}

module.exports = { genSortObject }
