process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const Server = require('../server')
const User = require('../models/user')
const Follow = require('../models/follow')
const { hashPassword } = require('../utils/auth')
const should = chai.should()

chai.use(chaiHttp)

describe('FOLLOW endpoints', () => {

    let server

    let user1 = {
      id: '',
      token: '',
      email: 'user1@test.com',
      password: '123456'
    }
    
    let user2 = {
      id: '',
      token: '',
      email: 'user2@test.com',
      password: '123456'
    }

    before(async () => {
      server = new Server()
      await server.run()

      const users = await User.insertMany([
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

      user1.id = users[0]._id
      user2.id = users[1]._id

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
        await Follow.deleteMany({}).exec()
        await server.stop()
      } catch(err) {
        console.log(err.message)
      }
    })

    describe('*********** /POST create follow ***********', () => {
      it('it should create follow successfully', (done) => {
        chai
        .request(server.httpServer)
        .post('/follows/'+user2.id)
        .set('Authorization', user1.token)
        .end((_, res) => {
            res.should.have.status(201)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('FOLLOW_CREATED')
            done()
        })
      })
      
      it('it should fail since follow already exist', (done) => {
        chai
          .request(server.httpServer)
          .post('/follows/'+user2.id)
          .set('Authorization', user1.token)
          .end((_, res) => {
            res.should.have.status(422)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('FOLLOW_ALREADY_EXISTS')
            done()
        })
      })
        
      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/follows/'+id)
            .set('Authorization', user1.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
      
      it('it should fail since no token was provided', (done) => {
        chai
          .request(server.httpServer)
          .post('/follows/'+user1.id)
          .end((_, res) => {
            res.should.have.status(401)
            res.body.should.be.an('object')
            res.body.should.have.property('msg')
            done()
        })
      })
    })

    describe('*********** /DELETE delete follow ***********', () => {
      it('it should delete follow successfully', (done) => {
        chai
          .request(server.httpServer)
          .delete('/follows/'+user2.id)
          .set('Authorization', user1.token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('FOLLOW_DELETED')
            done()
        })
      })

      it('it should fail since follow does not exist', (done) => {
        chai
          .request(server.httpServer)
          .delete('/follows/'+user2.id)
          .set('Authorization', user1.token)
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('FOLLOW_NOT_FOUND')
            done()
        })
      })

      const error_ids = ['', 'invalid_id']
      error_ids.map(id => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .delete('/follows/'+id)
            .set('Authorization', user1.token)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
      
      it('it should fail since no token was provided', (done) => {
        chai
          .request(server.httpServer)
          .delete('/follows/'+user1.id)
          .end((_, res) => {
            res.should.have.status(401)
            res.body.should.be.an('object')
            res.body.should.have.property('msg')
            done()
        })
      })
    })

})
