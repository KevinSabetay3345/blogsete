process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const Server = require('../server')
const mongoose = require('mongoose')
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const Like = require('../models/like')
const { hashPassword } = require('../utils/auth')
const should = chai.should()

chai.use(chaiHttp)

describe('LIKE endpoints', () => {

    let server

    let user = {
      id: '',
      token: '',
      email: 'user@test.com',
      password: '123456',
      post_id: '',
      comment_id: ''
    }

    before(async () => {
      server = new Server()
      await server.run()

      const users = await User.insertMany([
        {
          name: 'test name',
          role: 'user',
          email: user.email,
          password: await hashPassword(user.password)
        }
      ])
      user.id = users[0]._id

      const user_login = await chai.request(server.httpServer)
        .post('/login')
        .send({ email: user.email, password: user.password })
      user.token = user_login.body.token

      const posts = await Post.insertMany([
        {
            createdBy: user.id,
            assets: [],
            description: 'test post 1'
        }
      ])
      user.post_id = posts[0]._id

      const comments = await Comment.insertMany([
        {
          deleted: false,
          post_id: user.post_id,
          createdBy: user.id,
          message: 'test comment'
        }
      ])
      user.comment_id = comments[0]._id
    })

    after(async () => {
      try {
        await User.deleteMany({}).exec()
        await Post.deleteMany({}).exec()
        await Comment.deleteMany({}).exec()
        await Like.deleteMany({}).exec()
        await server.stop()
      } catch(err) {
        console.log(err.message)
      }
    })

    describe('*********** /POST create comment like ***********', () => {
      it('it should create like successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/likes/comment/'+user.comment_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(201)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('LIKE_CREATED')
            done()
        })
      })

      it('it should create like only once', (done) => {
        chai
          .request(server.httpServer)
          .post('/likes/comment/'+user.comment_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(422)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('LIKE_ALREADY_EXISTS')
            done()
        })
      })
      
      it('it should fail since comment does not exist', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/comment/'+ new mongoose.mongo.ObjectId().toHexString())
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('COMMENT_NOT_FOUND')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/likes/comment/'+id)
            .set('Authorization', user.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })

    describe('*********** /POST create post like ***********', () => { 
      it('it should create like successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/likes/post/'+user.post_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(201)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('LIKE_CREATED')
            done()
        })
      })

      it('it should create like only once', (done) => {
        chai
          .request(server.httpServer)
          .post('/likes/post/'+user.post_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(422)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('LIKE_ALREADY_EXISTS')
            done()
        })
      })
      
      it('it should fail since post does not exist', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/post/'+ new mongoose.mongo.ObjectId().toHexString())
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('POST_NOT_FOUND')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/likes/post/'+id)
            .set('Authorization', user.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })

    describe('*********** /DELETE delete comment like ***********', () => {
      it('it should delete like successfully', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/comment/'+user.comment_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('LIKE_DELETED')
            done()
        })
      })
      
      it('it should fail since like was already deleted', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/comment/'+user.comment_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('COMMENT_LIKE_NOT_FOUND')
            done()
        })
      })
      
      it('it should fail since comment does not exist', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/comment/'+ new mongoose.mongo.ObjectId().toHexString())
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('COMMENT_NOT_FOUND')
            done()
        })
      })

      it('it should recreate successfully after delete', (done) => {
        chai
          .request(server.httpServer)
          .post('/likes/comment/'+ user.comment_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(201)
            res.body.should.have.property('msg').eql('LIKE_CREATED')
            done()
        })
      })
      
      it('it should delete like successfully', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/comment/'+user.comment_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('LIKE_DELETED')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .delete('/likes/comment/'+id)
            .set('Authorization', user.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })
    
    describe('*********** /DELETE delete post like ***********', () => {
      it('it should delete like successfully', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/post/'+user.post_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('LIKE_DELETED')
            done()
        })
      })
      
      it('it should fail since like was already deleted', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/post/'+user.post_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('POST_LIKE_NOT_FOUND')
            done()
        })
      })
      
      it('it should fail since post does not exist', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/post/'+ new mongoose.mongo.ObjectId().toHexString())
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('POST_NOT_FOUND')
            done()
        })
      })

      it('it should recreate successfully after delete', (done) => {
        chai
          .request(server.httpServer)
          .post('/likes/post/'+ user.post_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(201)
            res.body.should.have.property('msg').eql('LIKE_CREATED')
            done()
        })
      })
      
      it('it should delete like successfully', (done) => {
        chai
          .request(server.httpServer)
          .delete('/likes/post/'+user.post_id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('LIKE_DELETED')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .delete('/likes/post/'+id)
            .set('Authorization', user.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })
})
