const { matchedData } = require('express-validator')
const UsersService = require("../../services/usersService")
 
class UsersController {
    createUserAdmin = async(req, res) => {
        const data = matchedData(req)
        const response = await UsersService.createUserAdmin(req.user, data)
        res.status(response.status).json({ msg: response.message })
    }
    
    updateUser = async(req, res) => {
        const data = matchedData(req)
        const response = await UsersService.updateUser(req.user, data)
        res.status(response.status).json({ msg: response.message })
    }

    deleteUser = async(req, res) => {
        const data = matchedData(req)
        const response = await UsersService.deleteUser(req.user, data.id)
        res.status(response.status).json({ msg: response.message })
    }
    
    getUser = async(req, res) => {
        const data = matchedData(req)
        const response = await UsersService.getUser(data.id)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ user: response.user })
        }
    }
    
    getUserPosts = async(req, res) => {
        const data = matchedData(req)
        const response = await UsersService.getUserPosts(data.id, data.limit, data.skip, data.sortBy)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ posts: response.posts })
        }
    }
}

module.exports = new UsersController()