const { matchedData } = require('express-validator')
const PostsService = require("../../services/postsService")
 
class PostsController {
    createPost = async(req, res) => {
        const data = matchedData(req)
        const response = await PostsService.createPost(req.user, data)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ post: response.post })
        }
    }

    deletePost = async(req, res) => {
        const data = matchedData(req)
        const response = await PostsService.deletePost(req.user, data.id)
        res.status(response.status).json({ msg: response.message })
    }
    
    updatePost = async(req, res) => {
        const data = matchedData(req)
        const response = await PostsService.updatePost(req.user, data)
        res.status(response.status).json({ msg: response.message })
    }
    
    getPost = async(req, res) => {
        const data = matchedData(req)
        const response = await PostsService.getPost(data.id)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ post: response.post })
        }
    }
    
    getPostComments = async(req, res) => {
        const data = matchedData(req)
        const response = await PostsService.getPostComments(data.id, data.limit, data.skip, data.sortBy)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ comments: response.comments })
        }
    }    
    
    getPostLikes = async(req, res) => {
        const data = matchedData(req)
        const response = await PostsService.getPostLikes(data.id, data.limit, data.skip, data.sortBy)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ likes: response.likes })
        }
    }
}

module.exports = new PostsController()