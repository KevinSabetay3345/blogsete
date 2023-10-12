const config = require('../../config')
const Like = require('../like')
const Comment = require('../comment')
const Post = require('../post')
const mongoose = require('mongoose')

class LikesDAO {
    findPostLikes = async(post_id = '', limit = config.pagination.defaultLimit, skip = config.pagination.defaultSkip, sortBy = {}) => {
      try {
          const items = await Like.find({ post_id }).limit(limit).skip(skip).sort(sortBy).exec()
          if (!items.length) {
              throw { status: 404, message: 'LIKES_NOT_FOUND' }
          }
          return items
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }
    
    findCommentLikes = async(comment_id = '', limit = config.pagination.defaultLimit, skip = config.pagination.defaultSkip, sortBy = {}) => {
      try { 
          const items = await Like.find({ comment_id }).limit(limit).skip(skip).sort(sortBy).exec()
          if (!items.length) {
              throw { status: 404, message: 'LIKES_NOT_FOUND' }
          }
          return items
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }

    //inserts only once
    createCommentLike = async (createdBy = '', comment_id = '') => {
        const session = await mongoose.startSession()
        await session.startTransaction()
        let response = {}

        try {
          const createdLike = await Like.updateOne({ createdBy, comment_id }, { createdBy }, { upsert: true }).session(session)
          if (createdLike.matchedCount === 1) {
            throw { status: 422, message: 'LIKE_ALREADY_EXISTS' }
          }

          await Comment.updateOne(
            {_id: comment_id},
            {$inc: {
              likesCount: 1
            }}
          ).session(session)
      
          await session.commitTransaction()
         
          response = createdLike
      
        } catch (error) {
          await session.abortTransaction()
          response = { error: { status: error.status || 500, message: error.message } }
      
        } finally {
          await session.endSession()
          return response
        }
    }
    
    //inserts only once
    createPostLike = async (createdBy = '', post_id = '') => {
      const session = await mongoose.startSession()
      await session.startTransaction()
      let response = {}

      try {
        const createdLike = await Like.updateOne({ createdBy, post_id }, { createdBy }, { upsert: true }).session(session)
        if (createdLike.matchedCount === 1) {
          throw { status: 422, message: 'LIKE_ALREADY_EXISTS' }
        }

        await Post.updateOne(
          {_id: post_id},
          {$inc: {
            likesCount: 1
          }}
        ).session(session)
    
        await session.commitTransaction()
       
        response = createdLike
    
      } catch (error) {
        await session.abortTransaction()
        response = { error: { status: error.status || 500, message: error.message } }
    
      } finally {
        await session.endSession()
        return response
      }
    }

    deleteCommentLike = async(createdBy = '', comment_id = '') => {
        const session = await mongoose.startSession()
        await session.startTransaction()
        let response = {}

        try {
            const deletedLike = await Like.deleteOne({ createdBy, comment_id }).session(session)
            if (deletedLike.deletedCount === 0) {
              throw { status: 404, message: 'COMMENT_LIKE_NOT_FOUND' }
            }
              
            await Comment.updateOne(
              {_id: comment_id},
              {$inc: {
                likesCount: -1
              }}
            ).session(session)

            await session.commitTransaction()

            response = 'LIKE_DELETED'

        } catch (error) {
            await session.abortTransaction()
            response = { error: { status: error.status || 500, message: error.message } }

        } finally {
            await session.endSession()
            return response
        }
    }

    deletePostLike = async(createdBy = '', post_id = '') => {
        const session = await mongoose.startSession()
        await session.startTransaction()
        let response = {}

        try {
            const deletedLike = await Like.deleteOne({ createdBy, post_id }).session(session)
            if (deletedLike.deletedCount === 0) {
              throw { status: 404, message: 'POST_LIKE_NOT_FOUND' }
            }
              
            await Post.updateOne(
              {_id: post_id},
              {$inc: {
                likesCount: -1
              }}
            ).session(session)

            await session.commitTransaction()

            response = 'LIKE_DELETED'

        } catch (error) {
            await session.abortTransaction()
            response = { error: { status: error.status || 500, message: error.message } }

        } finally {
            await session.endSession()
            return response
        }
    }
}

module.exports = new LikesDAO()