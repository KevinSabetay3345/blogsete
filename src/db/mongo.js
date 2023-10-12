const mongoose = require('mongoose')
const config = require('../config')

const initDB = async() => {
  try {
    await mongoose.connect(config.database.url, config.database.properties)
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'Connection error.'))
    db.once('open', function callback() {
      console.log("Connection with database succeeded.")
    })
  } catch(error) {
    console.log('Error connecting to database.')
    console.log(error)
  }
}

module.exports = initDB
