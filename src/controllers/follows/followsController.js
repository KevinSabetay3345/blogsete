const { matchedData } = require('express-validator')
const FollowsService = require("../../services/followsService")
 
class FollowsController {
    createFollow = async(req, res) => {
        const data = matchedData(req)
        const response = await FollowsService.createFollow(req.user._id, data.id)
        res.status(response.status).json({ msg: response.message })
    }

    deleteFollow = async(req, res) => {
        const data = matchedData(req)
        const response = await FollowsService.deleteFollow(req.user._id, data.id)
        res.status(response.status).json({ msg: response.message })
    }
}

module.exports = new FollowsController()