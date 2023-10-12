const config = require('../../config')
const Post = require('../post')
const User = require('../user')
const mongoose = require('mongoose')

class PostsDAO {
    findById = async (id = '') => {
        try {
          const item = await Post.findById(id).exec()
          if (!item) {
            throw { status: 404, message: 'POST_NOT_FOUND' }
          }
          return item
        } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
        }
    }

    findUserPosts = async (id = '', limit = config.pagination.defaultLimit, skip = config.pagination.defaultSkip, sortBy = {}) => {
      try {
          const item = await Post.find({ createdBy: id }).limit(limit).skip(skip).sort(sortBy).exec()
          if (!item.length) {
            throw { status: 404, message: 'POSTS_NOT_FOUND' }
          }
          return item
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }
    
    updatePost = async (post = {}) => {
      try {
          const updateResult = await Post.updateOne({ _id: post._id }, post).exec()
          if (updateResult.modifiedCount === 0) {
            throw { status: 404, message: 'POST_NOT_FOUND' }
          }
          return 'POST_UPDATED'
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }

    createPost = async ({ createdBy = '', description = '', assets = '' }) => {
        const session = await mongoose.startSession()
        await session.startTransaction()
        let response = {}

        try {
          const post = new Post({ createdBy, description, assets })
          const createdPost = await post.save({ session })

          await User.updateOne(
            {_id: createdBy},
            {$inc: {
              postsCount: 1
            }}
          ).session(session)
          
          await session.commitTransaction()
         
          response = createdPost
      
        } catch (error) {
          await session.abortTransaction()
          response = { error: { status: error.status || 500, message: error.message } }
      
        } finally {
          await session.endSession()
          return response
        }
    }

    deletePost = async(_id = '', createdBy = '') => {
        const session = await mongoose.startSession()
        await session.startTransaction()
        let response = {}

        try {
            const deletedPost = await Post.deleteOne({ _id }).session(session)
            if (deletedPost.deletedCount === 0) {
              throw { status: 404, message: 'POST_NOT_FOUND' }
            }

            await User.updateOne(
              {_id: createdBy},
              {$inc: {
                postsCount: -1
              }}
            ).session(session)
          
            await session.commitTransaction()

            response = 'POST_DELETED'

        } catch (error) {
            await session.abortTransaction()
            response = { error: { status: error.status || 500, message: error.message } }

        } finally {
            await session.endSession()
            return response
        }
    }
}

module.exports = new PostsDAO()