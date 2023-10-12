const PostsDAO = require('../models/DAO/postsDAO')
const CommentsDAO = require('../models/DAO/commentsDAO')
const LikesDAO = require('../models/DAO/likesDAO')

class PostsService {
    getPost = async (post_id) => {
        const post = await PostsDAO.findById(post_id)
        if (post.error) return post.error

        return { status: 200, post }
    }

    getPostComments = async (post_id, limit, skip, sortBy) => {
        const postComments = await CommentsDAO.findPostComments(post_id, limit, skip, sortBy)
        if (postComments.error) return postComments.error

        return { status: 200, comments: postComments }
    }
    
    getPostLikes = async (post_id, limit, skip, sortBy) => {
        const postLikes = await LikesDAO.findPostLikes(post_id, limit, skip, sortBy)
        if (postLikes.error) return postLikes.error

        return { status: 200, likes: postLikes }
    }

    createPost = async (req_user, post) => {
        post.createdBy = req_user._id
        const newPost = await PostsDAO.createPost(post)
        if (newPost.error) return newPost.error

        return { status: 201, post: newPost }
    }

    updatePost = async (req_user, newPost) => {
        const post = await PostsDAO.findById(newPost.id)
        if (post.error) return post.error

        if (req_user.role !== "admin" && post.createdBy.toHexString() !== req_user._id) {
            return { status: 403, message: 'FORBIDDEN' }
        }
        
        post.description = newPost.description
        post.assets = newPost.assets
        const postUpdate = await PostsDAO.updatePost(post)
        if (postUpdate.error) return postUpdate.error
    
        return { status: 200, message: 'POST_UPDATED' }
    }

    deletePost = async (req_user, post_id) => {
        const post = await PostsDAO.findById(post_id)
        if (post.error) return post.error

        if (req_user.role !== 'admin' && post.createdBy.toHexString() !== req_user._id) {
            return { status: 403, message: 'FORBIDDEN' }
        }

        const deletedPost = await PostsDAO.deletePost(post_id, post.createdBy.toHexString())
        if (deletedPost.error) return deletedPost.error

        return { status: 200, message: 'POST_DELETED' }
    }
}

module.exports = new PostsService()