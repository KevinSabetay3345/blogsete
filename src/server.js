const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const routes = require('./routes')
const initDB = require('./db/mongo')
const config = require('./config')

class Server {
    run = async () => {
        console.log('Starting blog application.')
        
        const app = express()

        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())
        app.use(cors())
        app.use(compression())
        app.use(helmet())
        
        //logging
        if (config.env === 'prod') {
            const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
            app.use(morgan('combined', { stream: accessLogStream }))
        }
        if (config.env === 'dev') {
            app.use(morgan('dev'))
        }

        app.use('/', routes)
        
        await initDB()
        
        this.httpServer = app.listen(config.server.port, () =>
            console.log('Server started on port: ' + config.server.port)
        )
        
        this.httpServer.on("error", (error) =>
            console.log('Server error: ' + error.message)
        )
    }

    stop = async () => {
        this.httpServer.close()
        await mongoose.disconnect()
    }
}

module.exports = Server
