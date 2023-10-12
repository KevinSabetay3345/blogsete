const FollowsDAO = require('../models/DAO/followsDAO')

class FollowsService {
    createFollow = async (from, to) => {
        const follow = await FollowsDAO.find(from, to)
        if (!follow.error) {
            return { status: 422, message: 'FOLLOW_ALREADY_EXISTS' }
        }
        
        const newFollow = await FollowsDAO.createFollow(from, to)
        if (newFollow.error) return newFollow.error

        return { status: 201, message: 'FOLLOW_CREATED' }
    }
    
    deleteFollow = async (from, to) => {
        const follow = await FollowsDAO.find(from, to)
        if (follow.error) return follow.error
        
        const deletedFollow = await FollowsDAO.deleteFollow(from, to)
        if (deletedFollow.error) return deletedFollow.error

        return { status: 200, message: 'FOLLOW_DELETED' }
    }
}

module.exports = new FollowsService()