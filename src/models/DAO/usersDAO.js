const User = require('../user')
const UserAccess = require('../userAccess')

class UsersDAO {
    findById = async (id = '') => {
      try {
          const item = await User.findById(id).exec()
          if (!item) {
            throw { status: 404, message: 'USER_NOT_FOUND' }
          }
          return item
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }
 
    findByEmail = async (email = '') => {
      try {
          const item = await User.findOne({ email }).exec()
          if (!item) {
            throw { status: 404, message: 'USER_NOT_FOUND' }
          }
          return item
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }
 
    findWithVerification = async (verification = '') => {
      try {
          const item = await User.findOne({ verification, verified: false }).exec()
          if (!item) {
            throw { status: 404, message: 'NOT_FOUND_OR_ALREADY_VERIFIED' }
          }
          return item
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }

    updateUser = async (user = {}) => {
      try {
          const updateResult = await User.updateOne({ _id: user._id }, user).exec()
          if (updateResult.modifiedCount === 0) {
            throw { status: 404, message: 'USER_NOT_FOUND' }
          }
          return 'USER_UPDATED'
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }

    createUser = async (user) => {
      try {
        await new User(user).save()

        return 'USER_CREATED'
      } catch(error) {
        return { error: { status: error.status || 500, message: error.message } }
      }
    }

    createUserAccess = async (email = '', action = '', ip = '', browser = '', country = '') => {
      try {
        const access = new UserAccess({ email, action, ip, browser, country })
        const newAccess = await access.save()
        return newAccess
      } catch(error) {
        return { error: { status: error.status || 500, message: error.message } }
      }
    }

    deleteUser = async(id = '') => {
      //TODO: Delete everything related to user (comments, likes, posts, etc)
      return { error: { status: 500, message: "SERVICE_NOT_IMPLEMENTED" } }
    }
}

module.exports = new UsersDAO()