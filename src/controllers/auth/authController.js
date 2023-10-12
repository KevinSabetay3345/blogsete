const { matchedData } = require('express-validator')
const AuthService = require("../../services/authService")
 
class AuthController {
    login = async(req, res) => {
        const data = matchedData(req)
        const response = await AuthService.login(req, data.email, data.password)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ user: response.user, token: response.token })
        }
    }
    
    register = async(req, res) => {
        const data = matchedData(req)
        const response = await AuthService.register(data)
        res.status(response.status).json({ msg: response.message })
    }
    
    forgotPassword = async(req, res) => {
        const data = matchedData(req)
        const response = await AuthService.forgotPassword(req, data.email)
        res.status(response.status).json({ msg: response.message })
    }
    
    resetPassword = async(req, res) => {
        const data = matchedData(req)
        const response = await AuthService.resetPassword(req, data.verification, data.newPassword)
        res.status(response.status).json({ msg: response.message })
    }
    
    verifyUser = async(req, res) => {
        const data = matchedData(req)
        const response = await AuthService.verifyUser(data.verification)
        res.status(response.status).json({ msg: response.message })
    }
    
    refreshToken = async(req, res) => {
        const response = await AuthService.refreshToken(req)
        if (response.message) {
            res.status(response.status).json({ msg: response.message })
        } else {
            res.status(response.status).json({ user: response.user, token: response.token })
        }
    }
}

module.exports = new AuthController()