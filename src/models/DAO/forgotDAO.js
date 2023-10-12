const Forgot = require('../forgotPassword')

class ForgotDao {
    findWithVerification = async (verification = '') => {
      try {
          const item = await Forgot.findOne({ verification, used: false }).exec()
          if (!item) {
            throw { status: 404, message: 'NOT_FOUND_OR_ALREADY_USED' }
          }
          return item
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }

    updateForgot = async (forgot = {}) => {
      try {
          const updateResult = await Forgot.updateOne({ _id: forgot._id }, forgot).exec()
          if (updateResult.modifiedCount === 0) {
            throw { status: 404, message: 'FORGOT_NOT_FOUND' }
          }
          return 'FORGOT_UPDATED'
      } catch (error) {
          return { error: { status: error.status || 500, message: error.message } }
      }
    }

    createForgot = async (email = '', verification = '', ipRequest = '', browserRequest = '', countryRequest = '') => {
      try {
        const forgot = new Forgot({ email, verification, ipRequest, browserRequest, countryRequest })
        const forgotCreated = await forgot.save()
        return forgotCreated
      } catch(error) {
        return { error: { status: error.status || 500, message: error.message } }
      }
    }
}

module.exports = new ForgotDao()