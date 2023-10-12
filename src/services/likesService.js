const LikesDAO = require('../models/DAO/likesDAO')
const PostsDAO = require('../models/DAO/postsDAO')
const CommentsDAO = require('../models/DAO/commentsDAO')

class LikesService {
    createCommentLike = async (req_user, comment_id) => {
        const comment = await CommentsDAO.findById(comment_id)
        if (comment.error) return comment.error
        
        const newLike = await LikesDAO.createCommentLike(req_user._id, comment_id)
        if (newLike.error) return newLike.error

        return { status: 201, message: 'LIKE_CREATED'}
    }

    createPostLike = async (req_user, post_id) => {
        const post = await PostsDAO.findById(post_id)
        if (post.error) return post.error

        const newLike = await LikesDAO.createPostLike(req_user._id, post_id)
        if (newLike.error) return newLike.error

        return { status: 201, message: 'LIKE_CREATED'}
    }

    deleteCommentLike = async (req_user, comment_id) => {
        const comment = await CommentsDAO.findById(comment_id)
        if (comment.error) return comment.error

        const deletedComment = await LikesDAO.deleteCommentLike(req_user._id, comment_id)
        if (deletedComment.error) return deletedComment.error

        return { status: 200, message: 'LIKE_DELETED' }
    }
    
    deletePostLike = async (req_user, post_id) => {
        const post = await PostsDAO.findById(post_id)
        if (post.error) return post.error

        const deletedPost = await LikesDAO.deletePostLike(req_user._id, post_id)
        if (deletedPost.error) return deletedPost.error

        return { status: 200, message: 'LIKE_DELETED' }
    }
}

module.exports = new LikesService()