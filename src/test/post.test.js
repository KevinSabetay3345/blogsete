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
const config = require('../config')
const should = chai.should()

chai.use(chaiHttp)

describe('POST endpoints', () => {

    let server

    let admin = {
      id: '',
      token: '',
      email: 'admin@test.com',
      password: '123456',
      post_id: ''
    }
    
    let user1 = {
      id: '',
      token: '',
      email: 'user1@test.com',
      password: '123456',
      post_id: ''
    }
    
    let user2 = {
      id: '',
      token: '',
      email: 'user2@test.com',
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

    let exceeded_assets = []
    for (let i = 0; i <= 10; i++) {
      exceeded_assets.push({ url: 'cdn.exceedAmountOf10.com', type: 'image' })
    }

    describe('*********** /POST create post ***********', () => {
      [admin, user1, user2].map(user => {
        it('it should create post successfully', (done) => {
          chai
            .request(server.httpServer)
            .post('/posts/')
            .set('Authorization', user.token)
            .send({
              assets: [
                {
                  url: 'cdn.uploadedAssetUrl.com',
                  type: 'image'
                }
              ],
              description: 'Testing the creation of a new post'
            })
            .end((_, res) => {
              res.should.have.status(201)
              res.body.should.be.an('object')
              res.body.should.have.property('post')
              user.post_id = res.body.post._id
              done()
          })
        })
      })
      
      const error_params = [
        {},
        { assets: '' },
        { assets: [] },
        { assets: [{ url: 'cdn.uploadedAssetUrl.com', type: '' }] },
        { assets: [{ url: 'cdn.uploadedAssetUrl.com', type: 'invalid_type' }] },
        { assets: [{ url: '', type: 'text' }] },
        { assets: [{ url: 'invalid_url_format', type: 'text' }] },
        { assets: [{ url: '.com', type: 'text' }] },
        { assets: exceeded_assets },
        { description: 123456, assets: [{ url: 'cdn.uploadedAssetUrl.com', type: 'text' }] },
      ]
      error_params.map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/posts')
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

    describe('*********** /GET get post ***********', () => {
      it('it should get post successfully', (done) => {
        chai
          .request(server.httpServer)
          .get('/posts/'+user1.post_id)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('post')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .get('/posts/'+id)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      it('it should fail since post does not exist', (done) => {
        chai
          .request(server.httpServer)
          .get('/posts/'+ new mongoose.mongo.ObjectId().toHexString())
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('POST_NOT_FOUND')
            done()
        })
      })
    })
    
    describe('*********** /GET get post comments ***********', () => {

      before(async () => {
        let comments = []
        for (let i = 0; i <= 5; i++) {
            comments.push({
              post_id: user1.post_id,
              createdBy: user1.id,
              message: 'test comment '+i
            })
        }

        await Comment.insertMany(comments)
      })

      it('it should get comments successfully', (done) => {
        chai
          .request(server.httpServer)
          .get('/posts/'+user1.post_id+'/comments?limit=10&skip=0&sortBy=createdAt')
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
            .get('/posts/'+id+'/comments')
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
      
      it('it should fail since post does not exist', (done) => {
        chai
          .request(server.httpServer)
          .get('/posts/'+ new mongoose.mongo.ObjectId().toHexString()+'/comments')
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('COMMENTS_NOT_FOUND')
            done()
        })
      })
      
      it('it should fail since there is no comments', (done) => {
        chai
          .request(server.httpServer)
          .get('/posts/'+user2.post_id+'/comments')
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
            .get('/posts/'+user1.post_id+'/comments?'+queryString)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })
    
    describe('*********** /GET get post likes ***********', () => {

      before(async () => {
        await Like.insertMany([
          { post_id: user1.post_id, createdBy: user1.id },
          { post_id: user1.post_id, createdBy: user2.id },
          { post_id: user1.post_id, createdBy: admin.id }
        ])
      })
      
      it('it should get likes successfully', (done) => {
        chai
          .request(server.httpServer)
          .get('/posts/'+user1.post_id+'/likes?limit=10&skip=0&sortBy=createdAt')
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('likes')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .get('/posts/'+id+'/likes')
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
      
      it('it should fail since post does not exist', (done) => {
        chai
          .request(server.httpServer)
          .get('/posts/'+ new mongoose.mongo.ObjectId().toHexString()+'/likes')
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('LIKES_NOT_FOUND')
            done()
        })
      })
      
      it('it should fail since there is no likes', (done) => {
        chai
          .request(server.httpServer)
          .get('/posts/'+user2.post_id+'/likes')
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('LIKES_NOT_FOUND')
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
            .get('/posts/'+user1.post_id+'/likes?'+queryString)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })
    
    describe('*********** /PUT update post ***********', () => {
      it('it should update post successfully', (done) => {
        chai
          .request(server.httpServer)
          .put('/posts/'+user1.post_id)
          .set('Authorization', user1.token)
          .send({ assets: [{ url: 'cdn.updateAsset.com', type: 'image' }] })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('POST_UPDATED')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since post id is invalid', (done) => {
          chai
            .request(server.httpServer)
            .put('/posts/'+id)
            .set('Authorization', admin.token)
            .send({ assets: [{ url: 'cdn.uploadedAssetUrl.com', type: 'text' }], description: '123456' })
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      const error_params = [
        {},
        { assets: '' },
        { assets: [] },
        { assets: [{ url: 'cdn.uploadedAssetUrl.com', type: '' }] },
        { assets: [{ url: 'cdn.uploadedAssetUrl.com', type: 'invalid_type' }] },
        { assets: [{ url: '', type: 'text' }] },
        { assets: [{ url: 'invalid_url_format', type: 'text' }] },
        { assets: [{ url: '.com', type: 'text' }] },
        { assets: exceeded_assets },
        { description: 123456, assets: [{ url: 'cdn.uploadedAssetUrl.com', type: 'text' }] },
      ]
      error_params.map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .put('/posts/'+user1.post_id)
            .set('Authorization', admin.token)
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
          .put('/posts/'+user2.post_id)
          .set('Authorization', user1.token)
          .send({ assets: [{ url: 'cdn.updateAsset.com', type: 'image' }] })
          .end((_, res) => {
            res.should.have.status(403)
            res.body.should.have.property('msg').eql('FORBIDDEN')
            done()
          })
      })
      it('it should fail since only post owner and admins can update', (done) => {
        chai
          .request(server.httpServer)
          .put('/posts/'+admin.post_id)
          .set('Authorization', user2.token)
          .send({ assets: [{ url: 'cdn.updateAsset.com', type: 'image' }] })
          .end((_, res) => {
            res.should.have.status(403)
            res.body.should.have.property('msg').eql('FORBIDDEN')
            done()
          })
      })
      
      it('it should update post successfully from admin account', (done) => {
        chai
          .request(server.httpServer)
          .put('/posts/'+user2.post_id)
          .set('Authorization', admin.token)
          .send({ assets: [{ url: 'cdn.updateAsset.com', type: 'image' }] })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('POST_UPDATED')
            done()
          })
      })
    })

    describe('*********** /DELETE delete post ***********', () => {
      it('it should delete post successfully', (done) => {
        chai
          .request(server.httpServer)
          .delete('/posts/'+user1.post_id)
          .set('Authorization', user1.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('POST_DELETED')
            done()
        })
      })

      it('it should fail since post does not exist', (done) => {
        chai
          .request(server.httpServer)
          .delete('/posts/'+user1.post_id)
          .set('Authorization', user1.token)
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
            .delete('/posts/'+id)
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
          .delete('/posts/'+user2.post_id)
          .set('Authorization', user1.token)
          .end((_, res) => {
            res.should.have.status(403)
            res.body.should.have.property('msg').eql('FORBIDDEN')
            done()
          })
      })
      it('it should fail since only post owner and admins can delete', (done) => {
        chai
          .request(server.httpServer)
          .delete('/posts/'+admin.post_id)
          .set('Authorization', user2.token)
          .end((_, res) => {
            res.should.have.status(403)
            res.body.should.have.property('msg').eql('FORBIDDEN')
            done()
          })
      })
      
      it('it should delete post successfully from admin account', (done) => {
        chai
          .request(server.httpServer)
          .delete('/posts/'+user2.post_id)
          .set('Authorization', admin.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('POST_DELETED')
            done()
          })
      })
    })

})
