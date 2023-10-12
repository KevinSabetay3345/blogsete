const { matchedData } = require('express-validator')
const LikesService = require("../../services/likesService")
 
class LikesController {
    createPostLike = async(req, res) => {
        const data = matchedData(req)
        const response = await LikesService.createPostLike(req.user, data.id)
        res.status(response.status).json({ msg: response.message })
    }

    createCommentLike = async(req, res) => {
        const data = matchedData(req)
        const response = await LikesService.createCommentLike(req.user, data.id)
        res.status(response.status).json({ msg: response.message })
    }

    deletePostLike = async(req, res) => {
        const data = matchedData(req)
        const response = await LikesService.deletePostLike(req.user, data.id)
        res.status(response.status).json({ msg: response.message })
    }
    
    deleteCommentLike = async(req, res) => {
        const data = matchedData(req)
        const response = await LikesService.deleteCommentLike(req.user, data.id)
        res.status(response.status).json({ msg: response.message })
    }
}

module.exports = new LikesController()