const UsersDAO = require('../models/DAO/usersDAO')
const PostsDAO = require('../models/DAO/postsDAO')
const { hashPassword } = require('../utils/auth')

class UsersService {
    createUserAdmin = async (req_user, user) => {
        if (req_user.role !== 'admin') {
          return { status: 403, message: 'FORBIDDEN' }
        }

        const hashedPassword = await hashPassword(user.password)
        if (hashedPassword.error) {
            return { status: 500, message: hashedPassword.error.message }
        }

        user.password = hashedPassword
        user.verified = true
        user.role = 'admin'
        const newUser = await UsersDAO.createUser(user)
        if (newUser.error) return newUser.error

        return { status: 201, message: 'USER_CREATED'}
    }

    updateUser = async (req_user, newUser) => {
        const user = await UsersDAO.findById(newUser.id)
        if (user.error) return user.error

        if (req_user.role !== 'admin' && req_user._id !== newUser.id) {
            return { status: 403, message: 'FORBIDDEN' }
        }

        if (newUser.email !== user.email) {
            const emailExists = await UsersDAO.findByEmail(newUser.email)
            if (!emailExists.error) {
                return { status: 422, message: 'EMAIL_ALREADY_EXISTS' }
            }
        }

        user.name = newUser.name
        user.email = newUser.email
        const userUpdate = await UsersDAO.updateUser(user)
        if (userUpdate.error) return userUpdate.error
    
        return { status: 200, message: 'USER_UPDATED' }
    }

    deleteUser = async (req_user, user_id) => {
        const user = await UsersDAO.findById(user_id)
        if (user.error) return user.error

        if (req_user.role !== 'admin' && req_user._id !== user_id) {
            return { status: 403, message: 'FORBIDDEN' }
        }

        const deletedUser = await UsersDAO.deleteUser(user_id)
        if (deletedUser.error) return deletedUser.error

        return { status: 200, message: 'USER_DELETED' }
    }

    getUser = async (user_id) => {
        const user = await UsersDAO.findById(user_id)
        if (user.error) return user.error

        user.role = undefined
        user.password = undefined
        user.createdAt = undefined
        user.updatedAt = undefined
        user.loginAttempts = undefined
        user.blockExpires = undefined
        user.followers = undefined
        user.followings = undefined
        return { status: 200, user }
    }

    getUserPosts = async (user_id, limit, skip, sortBy) => {
        const userPosts = await PostsDAO.findUserPosts(user_id, limit, skip, sortBy)
        if (userPosts.error) return userPosts.error

        return { status: 200, posts: userPosts }
    }
}

module.exports = new UsersService()