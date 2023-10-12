process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const Server = require('../server')
const User = require('../models/user')
const Post = require('../models/post')
const { hashPassword } = require('../utils/auth')
const mongoose = require('mongoose')
const config = require('../config')
const should = chai.should()

chai.use(chaiHttp)

describe('USERS endpoints', () => {

    let server
  
    let admin = {
      _id: '',
      token: '',
      email: 'admin@test.com',
      password: '123456'
    }
    
    let user = {
      _id: '',
      token: '',
      email: 'user@test.com',
      password: '123456',
      post_id: ''
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
          email: user.email,
          password: await hashPassword(user.password)
        }
      ])

      admin._id = users[0]._id
      user._id = users[1]._id

      const admin_login = await chai.request(server.httpServer)
        .post('/login')
        .send({ email: 'admin@test.com', password: '123456' })
      admin.token = admin_login.body.token
      
      const user_login = await chai.request(server.httpServer)
        .post('/login')
        .send({ email: 'user@test.com', password: '123456' })
      user.token = user_login.body.token

    })

    after(async () => {
      await User.deleteMany({}).exec()
      await Post.deleteMany({}).exec()
      await server.stop()
    })

    describe('*********** /GET get user ***********', () => {
      it('it should get user successfully', (done) => {
        chai
          .request(server.httpServer)
          .get('/users/'+admin._id)
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('user')
            done()
        })
      })

      const error_params = [
        { id: '' },
        { id: 123456 },
        { id: 'wrong id format' }
      ]

      error_params.map(testCase => {
        it('it should fail since id was empty or malformed', (done) => {
          chai
            .request(server.httpServer)
            .get('/users/'+testCase.id)
            .send(testCase)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })
    
    describe('*********** /POST create user admin ***********', () => {
      it('it should create user successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/users/')
          .send({ name: 'new user', email: 'newadmin@test.com', password: '123456' })
          .set('Authorization', admin.token)
          .end((_, res) => {
            res.should.have.status(201)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('USER_CREATED')
            done()
        })
      })

      const empty_params = [
        {},
        { name: '', email: '', password: '' },
        { name: 'new user', email: '', password: '' },
        { name: '', email: '', password: '123456' },
        { name: 'new user', email: 'test@test.com', password: '' },
        { name: '', email: 'test@test.com', password: '123456' },
        { name: 'new user', email: '', password: '123456' }
      ]
      const invalid_params = [
        { name: 123456, email: 'test@test.com', password: '123456' },
        { name: 'new user', email: 'test', password: '123456' },
        { name: 'new user', email: 'test@', password: '123456' },
        { name: 'new user', email: '@test', password: '123456' },
        { name: 'new user', email: '@test.com', password: '123456' },
        { name: 'new user', email: 'test@test', password: '123456' },
        { name: 'new user', email: 'test@test.com', password: 123456 }
      ]

      empty_params.concat(invalid_params).map(testCase => {
        it('it should fail since data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/users/')
            .send(testCase)
            .set('Authorization', admin.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      it('it should fail because only admins can create admin users', (done) => {
        chai
          .request(server.httpServer)
          .post('/users/')
          .send({ name: 'new user', email: 'test@test.com', password: '123456' })
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(403)
            res.body.should.have.property('msg').eql('FORBIDDEN')
            done()
          })
      })
    })

    describe('*********** /PUT update user ***********', () => {
      it('it should update user successfully', (done) => {
        chai
          .request(server.httpServer)
          .put('/users/'+user._id)
          .send({ name: 'new user name', email: 'updateuser@test.com' })
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('USER_UPDATED')
            done()
        })
      })
      
      it('it should fail since user does not exist', (done) => {
        chai
          .request(server.httpServer)
          .put('/users/'+ new mongoose.mongo.ObjectId().toHexString())
          .send({ name: 'new admin name', email: 'updateadmin@test.com' })
          .set('Authorization', admin.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('USER_NOT_FOUND')
            done()
        })
      })

      it('it should fail updating admin from user account', (done) => {
        chai
          .request(server.httpServer)
          .put('/users/'+admin._id)
          .send({ name: 'new admin name', email: 'updateadmin@test.com' })
          .set('Authorization', user.token)
          .end((_, res) => {
            res.should.have.status(403)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('FORBIDDEN')
            done()
        })
      })
      
      it('it should update user from admin account successfully', (done) => {
        chai
          .request(server.httpServer)
          .put('/users/'+user._id)
          .send({ name: 'new user name', email: 'updateuser@test.com' })
          .set('Authorization', admin.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('USER_UPDATED')
            done()
        })
      })
      
      it('it should fail since user email already exists', (done) => {
        chai
          .request(server.httpServer)
          .put('/users/'+user._id)
          .send({ name: 'repeated email', email: admin.email })
          .set('Authorization', admin.token)
          .end((_, res) => {
            res.should.have.status(422)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('EMAIL_ALREADY_EXISTS')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .put('/posts/'+id)
            .set('Authorization', admin.token)
            .send({ name: 'update user name', email: 'updateuser@test.com' })
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      const empty_params = [
        {},
        { name: '', email: '' },
        { name: 'update user', email: ''},
        { name: '', email: 'test@test.com' },
      ]
      const invalid_params = [
        { name: 123456, email: 'test@test.com' },
        { name: 'update user', email: 123465 },
        { name: 'update user', email: 'test@' },
        { name: 'update user', email: '@test' },
        { name: 'update user', email: '@test.com' },
        { name: 'update user', email: 'test@test' }
      ]

      empty_params.concat(invalid_params).map(testCase => {
        it('it should fail since data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .put('/users/'+user._id)
            .send(testCase)
            .set('Authorization', admin.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })

    describe('*********** /GET get user posts ***********', () => {

      before(async () => {
        const posts = await Post.insertMany([{ createdBy: user._id }])
        user.post_id = posts[0]._id
      })
      
      it('it should get posts successfully', (done) => {
        chai
          .request(server.httpServer)
          .get('/users/'+user._id+'/posts?limit=10&skip=0&sortBy=createdAt')
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('posts')
            done()
        })
      })

      it('it should fail since user does not exist', (done) => {
        chai
          .request(server.httpServer)
          .get('/users/'+ new mongoose.mongo.ObjectId().toHexString()+'/posts')
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('POSTS_NOT_FOUND')
            done()
        })
      })
      
      it('it should fail since there is no posts', (done) => {
        chai
          .request(server.httpServer)
          .get('/users/'+admin._id+'/posts')
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('POSTS_NOT_FOUND')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .get('/users/'+id+'/posts')
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
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
            .get('/posts/'+user.post_id+'/likes?'+queryString)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })

    describe('*********** /DELETE delete user ***********', () => {
      //TODO
    })
})
