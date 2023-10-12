process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const Server = require('../server')
const mongoose = require('mongoose')
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const { hashPassword } = require('../utils/auth')
const config = require('../config')
const should = chai.should()

chai.use(chaiHttp)

describe('COMMENT endpoints', () => {

    let server

    let admin = {
      id: '',
      token: '',
      email: 'admin@test.com',
      password: '123456'
    }
    
    let user1 = {
      id: '',
      token: '',
      email: 'user1@test.com',
      password: '123456',
      post_id: '',
      comment_id: ''
    }
    
    let user2 = {
      id: '',
      token: '',
      email: 'user2@test.com',
      password: '123456',
      comment_id: ''
    }

    before(async () => {
      server = new Server()
      await server.run()

      const users = await User.insertMany([
        {
          name: 'test name',
          role: 'admin',
          email: admin.email,
          password: await hashPassword(admin.password)
        },
        {
          name: 'test name',
          role: 'user',
          email: user1.email,
          password: await hashPassword(user1.password)
        },
        {
          name: 'test name',
          role: 'user',
          email: user2.email,
          password: await hashPassword(user2.password)
        }
      ])

      admin.id = users[0]._id
      user1.id = users[1]._id
      user2.id = users[2]._id

      const admin_login = await chai.request(server.httpServer)
        .post('/login')
        .send({ email: admin.email, password: admin.password })
      admin.token = admin_login.body.token
      
      const user1_login = await chai.request(server.httpServer)
        .post('/login')
        .send({ email: user1.email, password: user1.password })
      user1.token = user1_login.body.token

      const user2_login = await chai.request(server.httpServer)
        .post('/login')
        .send({ email: user2.email, password: user2.password })
      user2.token = user2_login.body.token

      const posts = await Post.insertMany([
        {
            createdBy: user1.id,
            assets: [],
            description: 'test post 1'
        }
      ])

      user1.post_id = posts[0]._id
    })

    after(async () => {
      try {
        await User.deleteMany({}).exec()
        await Post.deleteMany({}).exec()
        await Comment.deleteMany({}).exec()
        await server.stop()
      } catch(err) {
        console.log(err.message)
      }
    })

    describe('*********** /POST create comment ***********', () => { 
      it('it should create comment successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/comments/')
          .set('Authorization', user1.token)
          .send({
            message: 'test comment',
            post_id: user1.post_id
          })
          .end((_, res) => {
            res.should.have.status(201)
            res.body.should.be.an('object')
            res.body.should.have.property('comment')
            user1.comment_id = res.body.comment._id
            done()
        })
      })

      it('it should create replied comment successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/comments/')
          .set('Authorization', user2.token)
          .send({
            message: 'test comment',
            post_id: user1.post_id,
            repliedComment: user1.comment_id
          })
          .end((_, res) => {
            res.should.have.status(201)
            res.body.should.be.an('object')
            res.body.should.have.property('comment')
            user2.comment_id = res.body.comment._id
            done()
        })
      })
      
      const error_params = [
        {},
        { message: '', post_id: user1.post_id },
        { message: 123456, post_id: user1.post_id },
        { message: 'test message', post_id: '' },
        { message: 'test message', post_id: 'invalid_id' },
        { message: 'test message', post_id: 123456 },
        { message: 'test message', post_id: 123456 },
        { message: 'test message', post_id: user1.post_id, repliedComment: '' },
        { message: 'test message', post_id: user1.post_id, repliedComment: 'invalid_id' }
      ]

      error_params.map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/comments')
            .set('Authorization', admin.token)
            .send(testCase)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })
    
    describe('*********** /GET get replied comments ***********', () => {
      it('it should get replied comments successfully', (done) => {
        chai
          .request(server.httpServer)
          .get('/comments/'+user1.comment_id+'?limit=10&skip=0&sortBy=createdAt')
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('comments')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .get('/comments/'+id)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
      
      it('it should fail since comment does not exist', (done) => {
        chai
          .request(server.httpServer)
          .get('/comments/'+ new mongoose.mongo.ObjectId().toHexString())
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('COMMENTS_NOT_FOUND')
            done()
        })
      })
      
      const error_params = [
        'limit=invalid', 'skip=invalid',
        'skip=-1', 'skip='+config.pagination.maxSkip+1,
        'limit=0', 'limit=-1', 'limit='+config.pagination.maxLimit+1
      ]
      error_params.map(queryString => {
        it('it should fail since some data was invalid', (done) => {
          chai
            .request(server.httpServer)
            .get('/comments/'+user1.comment_id+'?'+queryString)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })
    
    describe('*********** /PUT update comment ***********', () => {
      it('it should update post successfully', (done) => {
        chai
          .request(server.httpServer)
          .put('/comments/'+user1.comment_id)
          .set('Authorization', user1.token)
          .send({ message: 'updated comment' })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('COMMENT_UPDATED')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since comment id is invalid', (done) => {
          chai
            .request(server.httpServer)
            .put('/comments/'+id)
            .set('Authorization', user1.token)
            .send({ message: 'error updating comment' })
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      const error_params = [
        { message: '' },
        { message: 123456 },
      ]
      error_params.map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .put('/comments/'+user1.comment_id)
            .set('Authorization', user1.token)
            .send(testCase)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      it('it should fail since only post owner and admins can update', (done) => {
        chai
          .request(server.httpServer)
          .put('/comments/'+user1.comment_id)
          .set('Authorization', user2.token)
          .send({ message: 'error updating comment' })
          .end((_, res) => {
            res.should.have.status(403)
            res.body.should.have.property('msg').eql('FORBIDDEN')
            done()
          })
      })
      
      it('it should update post successfully from admin account', (done) => {
        chai
          .request(server.httpServer)
          .put('/comments/'+user1.comment_id)
          .set('Authorization', admin.token)
          .send({ message: 'admin updating comment' })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('COMMENT_UPDATED')
            done()
          })
      })
    })

    describe('*********** /DELETE delete comment ***********', () => {
      it('it should delete comment successfully', (done) => {
        chai
          .request(server.httpServer)
          .delete('/comments/'+user1.comment_id)
          .set('Authorization', user1.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('COMMENT_DELETED')
            done()
        })
      })

      it('it should fail since comment does not exist', (done) => {
        chai
          .request(server.httpServer)
          .delete('/comments/'+user1.comment_id)
          .set('Authorization', user1.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('COMMENT_NOT_FOUND')
            done()
        })
      })
      it('it should fail since comment does not exist', (done) => {
        chai
          .request(server.httpServer)
          .delete('/comments/'+ new mongoose.mongo.ObjectId().toHexString())
          .set('Authorization', user1.token)
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
            .delete('/comments/'+id)
            .set('Authorization', admin.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      it('it should fail since only post owner and admins can delete', (done) => {
        chai
          .request(server.httpServer)
          .delete('/comments/'+user2.comment_id)
          .set('Authorization', user1.token)
          .end((_, res) => {
            res.should.have.status(403)
            res.body.should.have.property('msg').eql('FORBIDDEN')
            done()
          })
      })
      
      it('it should delete post successfully from admin account', (done) => {
        chai
          .request(server.httpServer)
          .delete('/comments/'+user2.comment_id)
          .set('Authorization', admin.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('COMMENT_DELETED')
            done()
          })
      })
    })
})
