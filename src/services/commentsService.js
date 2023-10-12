const CommentsDAO = require('../models/DAO/commentsDAO')
const PostsDAO = require('../models/DAO/postsDAO')

class CommentsService {
    createComment = async (req_user, comment) => {
        const post = await PostsDAO.findById(comment.post_id)
        if (post.error) return post.error

        if (comment.repliedComment) {
            const repliedComment = await CommentsDAO.findById(comment.repliedComment)
            if (repliedComment.error) return repliedComment.error
            
            if (repliedComment.post_id.toHexString() !== comment.post_id) {
                return { status: 400, message: 'REPLIED_COMMENT_AND_POST_DONT_MATCH' }
            }
        }
        
        comment.createdBy = req_user._id
        const newComment = await CommentsDAO.createComment(comment)
        if (newComment.error) return newComment.error

        return { status: 201, comment: newComment}
    }

    updateComment = async (req_user, id, message) => {
        const comment = await CommentsDAO.findById(id)
        if (comment.error) return comment.error

        if (req_user.role !== "admin" && comment.createdBy.toHexString() !== req_user._id) {
          return { status: 403, message: 'FORBIDDEN' }
        }

        comment.message = message
        const commentUpdate = await CommentsDAO.updateComment(comment)
        if (commentUpdate.error) return commentUpdate.error
    
        return { status: 200, message: 'COMMENT_UPDATED' }
    }

    deleteComment = async (req_user, comment_id) => {
        const comment = await CommentsDAO.findById(comment_id)
        if (comment.error) return comment.error

        if (req_user.role !== 'admin' && comment.createdBy.toHexString() !== req_user._id) {
            return { status: 403, message: 'FORBIDDEN' }
        }

        const deletedComment = await CommentsDAO.deleteComment(comment_id, comment.post_id, req_user.id)
        if (deletedComment.error) return deletedComment.error

        return { status: 200, message: 'COMMENT_DELETED' }
    }

    getRepliedComments = async (comment_id, limit, skip, sortBy) => {
        const repliedComments = await CommentsDAO.findRepliedComments(comment_id, limit, skip, sortBy)
        if (repliedComments.error) return repliedComments.error

        return { status: 200, comments: repliedComments }
    }
}

module.exports = new CommentsService()