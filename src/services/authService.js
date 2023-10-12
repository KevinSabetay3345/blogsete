const bcrypt = require('bcrypt')
const uuid = require('uuid')
const UsersDAO = require('../models/DAO/usersDAO')
const ForgotDAO = require('../models/DAO/forgotDAO')
const config = require('../config')
const { generateToken, hashPassword } = require('../utils/auth')
const { getIP, getBrowserInfo, getCountry } = require('../utils')

class AuthService {
    login = async (req, email, password) => {
        const user = await UsersDAO.findByEmail(email)
        if (user.error) return user.error

        if (user.blockExpires > new Date()) {
            return { status: 409, message: 'BLOCKED_USER' }
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            user.loginAttempts += 1
            if (user.loginAttempts > config.auth.loginAttempts) {
                user.loginAttempts = 0
                user.blockExpires = new Date(Date.now() + config.auth.hoursToBlock * 60 * 60 * 1000)
            }
            
            await UsersDAO.updateUser(user)
            return { status: 409, message: 'WRONG_PASSWORD' }
        }

        if (user.loginAttempts !== 0) {
            user.loginAttempts = 0
            const userUpdate = await UsersDAO.updateUser(user)
            if (userUpdate.error) return userUpdate.error
        }

        await UsersDAO.createUserAccess(email, req.path, getIP(req), getBrowserInfo(req), getCountry(req))

        return { 
            status: 200,
            token: generateToken(user._id, user.role),
            user: {
              _id: user._id,
              name: user.name,
              role: user.role,
              verified: user.verified
            }
        }
    }

    register = async (user) => {
        const emailExists = await UsersDAO.findByEmail(user.email)
        if (!emailExists.error) {
            return { status: 400, message: 'EMAIL_ALREADY_EXISTS' }
        }

        const hashedPassword = await hashPassword(user.password)
        if (hashedPassword.error) {
            return { status: 500, message: hashedPassword.error.message }
        }

        user.password = hashedPassword
        user.verification = uuid.v4()
        const userCreated = await UsersDAO.createUser(user)
        if (userCreated.error) return userCreated.error

        // TODO: sendRegistrationEmailMessage(user)

        return { status: 201, message: 'USER_REGISTERED' }
    }
    
    verifyUser = async (verification) => {
        const user = await UsersDAO.findWithVerification(verification)
        if (user.error) return user.error

        user.verified = true
        const userUpdate = await UsersDAO.updateUser(user)
        if (userUpdate.error) return userUpdate.error

        return { status: 200, message: 'USER_VERIFIED' }
    }

    forgotPassword = async (req, email) => {
        const user = await UsersDAO.findByEmail(email)
        if (user.error) return user.error

        const forgotCreated = await ForgotDAO.createForgot(email, uuid.v4(), getIP(req), getBrowserInfo(req), getCountry(req))
        if (forgotCreated.error) return forgotCreated.error
        
        // TODO: sendResetPasswordEmailMessage(user)
        
        return { status: 200, message: 'RESET_EMAIL_SENT' }
    }

    resetPassword = async (req, verification, password) => {
        const forgotPasswordInfo = await ForgotDAO.findWithVerification(verification)
        if (forgotPasswordInfo.error) return forgotPasswordInfo.error
        
        const user = await UsersDAO.findByEmail(forgotPasswordInfo.email)
        if (user.error) return user.error
        
        const hashedPassword = await hashPassword(password)
        if (hashedPassword.error) {
            return { status: 500, message: hashedPassword.error.message }
        }

        user.password = hashedPassword
        user.loginAttempts = 0
        user.blockExpires = new Date()
        const userUpdate = await UsersDAO.updateUser(user)
        if (userUpdate.error) return userUpdate.error

        forgotPasswordInfo.used = true
        forgotPasswordInfo.ipChanged = getIP(req)
        forgotPasswordInfo.browserChanged = getBrowserInfo(req)
        forgotPasswordInfo.countryChanged = getCountry(req)
        const forgotUpdate = await ForgotDAO.updateForgot(forgotPasswordInfo)
        if (forgotUpdate.error) return forgotUpdate.error

        return { status: 200, message: 'PASSWORD_CHANGED' }
    }
    
    refreshToken = async (req) => {
        const user = await UsersDAO.findById(req.user._id)
        if (user.error) return user.error

        await UsersDAO.createUserAccess(user.email, req.path, getIP(req), getBrowserInfo(req), getCountry(req))

        return {
            status: 200,
            token: generateToken(user._id, user.role),
            user: {
              _id: user._id,
              name: user.name,
              role: user.role,
              verified: user.verified
            }
        }
    }
}

module.exports = new AuthService()