const Follow = require('../follow')
const User = require('../user')
const mongoose = require('mongoose')

class FollowsDAO {
    find = async (from = '', to = '') => {
        try {
            const item = await Follow.findOne({ from, to }).exec()
            if (!item) {
              throw { status: 404, message: 'FOLLOW_NOT_FOUND' }
            }
            return item
        } catch (error) {
            return { error: { status: error.status || 500, message: error.message } }
        }
    }

    createFollow = async (from = '', to = '') => {
        const session = await mongoose.startSession()
        await session.startTransaction()
        let response = {}

        try {
          const follow = new Follow({ from, to })
          const createdFollow = await follow.save({ session })

          await User.updateOne(
            {_id: from},
            {$inc: {
              followings: 1
            }}
          ).session(session)
      
          await User.updateOne(
            {_id: to},
            {$inc: {
              followers: 1
            }}
          ).session(session)
          
          await session.commitTransaction()
         
          response = createdFollow
      
        } catch (error) {
          await session.abortTransaction()
          response = { error: { status: 500, message: error.message } }
      
        } finally {
          await session.endSession()
          return response
        }
    }

    deleteFollow = async(from = '', to = '') => {
        const session = await mongoose.startSession()
        await session.startTransaction()
        let response = {}

        try {
            const deletedFollow = await Follow.deleteOne({ from, to }).session(session)
            if (deletedFollow.deletedCount === 0) {
              throw { status: 404, message: 'FOLLOW_NOT_FOUND' }
            }

            await User.updateOne(
              {_id: from},
              {$inc: {
                followings: -1
              }}
            ).session(session)
        
            await User.updateOne(
              {_id: to},
              {$inc: {
                followers: -1
              }}
            ).session(session)

            await session.commitTransaction()

            response = 'FOLLOW_DELETED'

        } catch (error) {
            await session.abortTransaction()
            response = { error: { status: error.status || 500, message: error.message } }

        } finally {
            await session.endSession()
            return response
        }
    }
}

module.exports = new FollowsDAO()