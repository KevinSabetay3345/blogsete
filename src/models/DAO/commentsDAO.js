const config = require('../../config')
const Comment = require('../comment')
const Post = require('../post')
const mongoose = require('mongoose')

class CommentsDAO {
    findById = async (id = '') => {
        try {
            const item = await Comment.findById(id).exec()
            if (!item || item.deleted) {
              throw { status: 404, message: 'COMMENT_NOT_FOUND' }
            }
            return item
        } catch (error) {
            return { error: { status: error.status || 500, message: error.message } }
        }
    }
    
    findPostComments = async(post_id = '', limit = config.pagination.defaultLimit, skip = config.pagination.defaultSkip, sortBy = {}) => {
      try { 
          const items = await Comment.find({ post_id }).limit(limit).skip(skip).sort(sortBy).exec()
          if (!items.length) {
            throw { status: 404, message: 'COMMENTS_NOT_FOUND' }
          }
          return items
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }

    findRepliedComments = async(repliedComment = '', limit = config.pagination.defaultLimit, skip = config.pagination.defaultSkip, sortBy = {}) => {
        try { 
            const items = await Comment.find({ repliedComment }).limit(limit).skip(skip).sort(sortBy).exec()
            if (!items.length) {
              throw { status: 404, message: 'COMMENTS_NOT_FOUND' }
            }
            return items
        } catch (error) {
            return { error: { status: error.status || 500, message: error.message } }
        }
    }
    
    updateComment = async (comment = {}) => {
      try {
          const updateResult = await Comment.updateOne({ _id: comment._id }, comment).exec()
          if (updateResult.modifiedCount === 0) {
            throw { status: 404, message: 'COMMENT_NOT_FOUND' }
          }
          return 'COMMENT_UPDATED'
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }

    createComment = async ({ post_id = '', createdBy = '', message = '', repliedComment = '' }) => {
        const session = await mongoose.startSession()
        await session.startTransaction()
        let response = {}

        try {
          const comment = new Comment({ post_id, createdBy, message })
          if (repliedComment) {
            comment.repliedComment = repliedComment
          }
          
          const createdComment = await comment.save({ session })
      
          await Post.updateOne(
            {_id: post_id},
            {$inc: {
              commentsCount: 1
            }}
          ).session(session)
      
          if (repliedComment) {
            await Comment.updateOne(
              {_id: repliedComment},
              {$inc: {
                commentsCount: 1
              }}
            ).session(session)
          }
          
          await session.commitTransaction()
         
          response = createdComment
      
        } catch (error) {
          await session.abortTransaction()
          response = { error: { status: error.status || 500, message: error.message } }
      
        } finally {
          await session.endSession()
          return response
        }
    }

    deleteComment = async(comment_id = '') => {
      try {
          const updateResult = await Comment.updateOne({ _id: comment_id }, { deleted: true }).exec()
          if (updateResult.modifiedCount === 0) {
            throw { status: 404, message: 'COMMENT_NOT_FOUND' }
          }
          return 'COMMENT_DELETED'
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }
}

module.exports = new CommentsDAO()