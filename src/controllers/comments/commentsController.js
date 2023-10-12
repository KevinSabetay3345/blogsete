const { matchedData } = require('express-validator')
const CommentsService = require("../../services/commentsService")
 
class CommentsController {
    createComment = async(req, res) => {
        const data = matchedData(req)
        const response = await CommentsService.createComment(req.user, data)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ comment: response.comment })
        }
    }

    deleteComment = async(req, res) => {
        const data = matchedData(req)
        const response = await CommentsService.deleteComment(req.user, data.id)
        res.status(response.status).json({ msg: response.message })
    }
    
    updateComment = async(req, res) => {
        const data = matchedData(req)
        const response = await CommentsService.updateComment(req.user, data.id, data.message)
        res.status(response.status).json({ msg: response.message })
    }
    
    getRepliedComments = async(req, res) => {
        const data = matchedData(req)
        const response = await CommentsService.getRepliedComments(data.id, data.limit, data.skip, data.sortBy)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ comments: response.comments })
        }
    }
}

module.exports = new CommentsController()