process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const Server = require('../server')
const User = require('../models/user')
const Forgot = require('../models/forgotPassword')
const config = require('../config')
const should = chai.should()

chai.use(chaiHttp)

describe('AUTH endpoints', () => {

    let server
    let token = ''

    before(async () => {
      try {
        server = new Server()
        await server.run()
      } catch(err) {
        console.log(err.message)
      }
    })

    after(async () => {
      try {
        await User.deleteMany({}).exec()
        await Forgot.deleteMany({}).exec()
        await server.stop()
      } catch(err) {
        console.log(err.message)
      }
    })

    describe('*********** /POST register ***********', () => {
      it('it should register successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/register')
          .send({ name: 'user1', email: 'user1@test.com', password: '123456' })
          .end((_, res) => {
            res.should.have.status(201)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('USER_REGISTERED')
            done()
        })
      })
      
      it('it should fail because email can not repeat', (done) => {
        chai
          .request(server.httpServer)
          .post('/register')
          .send({ name: 'user1', email: 'user1@test.com', password: '123456' })
          .end((_, res) => {
            res.should.have.status(400)
            res.body.should.have.property('msg').eql('EMAIL_ALREADY_EXISTS')
            done()
          })
      })
      
      const empty_params = [
        {},
        { name: '', email: '', password: '' },
        { name: 'user test', email: '', password: '' },
        { name: '', email: 'test@test.com', password: '' },
        { name: '', email: '', password: '123456' },
        { name: 'user test', email: 'test@test.com', password: '' },
        { name: 'user test', email: '', password: '123456' },
        { name: '', email: 'test@test.com', password: '123456' },
      ]
      const invalid_params = [
        { name: 456789, email: 'test@test.com', password: '123456' },
        { name: 'name test', email: 123, password: '123456' },
        { name: 'name test', email: 'test', password: '123456' },
        { name: 'name test', email: '@test', password: '123456' },
        { name: 'name test', email: 'test@test', password: '123456' },
        { name: 'name test', email: 'test@test.com', password: 123456 },
        { name: 'name test', email: 'test@test.com', password: '12345' }
      ]
      empty_params.concat(invalid_params).map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/register')
            .send(testCase)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })

    describe('*********** /POST login ***********', () => {
      it('it should login successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/login')
          .send({ email: 'user1@test.com', password: '123456' })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('token')
            res.body.should.have.property('user')
            token = res.body.token
            done()
        })
      })

      const empty_params = [
        {},
        { email: '' },
        { email: 'user1@test.com' },
        { password: '' },
        { password: '123456' },
        { email: 'user1@test.com', password: '' },
        { email: '', password: '123456' }
      ]
      const invalid_params = [
        { password: '123456', email: 123 },
        { password: '123456', email: 'test' },
        { password: '123456', email: '@test.com' },
        { password: '123456', email: 'user1@test' },
        { email: 'user1@test.com', password: '12345' },
        { email: 'user1@test.com', password: 123456 }
      ]

      empty_params.concat(invalid_params).map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/login')
            .send(testCase)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      it('it should fail because password is wrong', (done) => {
        chai
          .request(server.httpServer)
          .post('/login')
          .send({ email: 'user1@test.com', password: '123457' })
          .end((_, res) => {
            res.should.have.status(409)
            res.body.should.have.property('msg').eql('WRONG_PASSWORD')
            done()
        })
      })
      it('it should login successfully after failure and reset login attempts', (done) => {
        chai
          .request(server.httpServer)
          .post('/login')
          .send({ email: 'user1@test.com', password: '123456' })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('token')
            res.body.should.have.property('user')
            done()
        })
      })

      for (let i = 0; i <= config.auth.loginAttempts; i++) {
        it('it should fail because password is wrong', (done) => {
          chai
            .request(server.httpServer)
            .post('/login')
            .send({ email: 'user1@test.com', password: '123457'+i })
            .end((err, res) => {
              res.should.have.status(409)
              res.body.should.have.property('msg').eql('WRONG_PASSWORD')
              done()
          })
        })
      }
      for (let i = 0; i < 2; i++) {
        it('it should fail because user is blocked', (done) => {
          chai
            .request(server.httpServer)
            .post('/login')
            .send({ email: 'user1@test.com', password: '123456' })
            .end((_, res) => {
              res.should.have.status(409)
              res.body.should.have.property('msg').eql('BLOCKED_USER')
              done()
          })
        })
      }
    })

    describe('*********** /POST verify user ***********', () => {

      let verification = ''

      before(async () => {
        try {
          const user = await User.findOne({ email: 'user1@test.com' })
          verification = user.verification
        } catch (err) {
          console.log(err.message)
        }
      })

      it('it should verify successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/verify')
          .send({ verification })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('USER_VERIFIED')
            done()
        })
      })

      const error_params = [
        {},
        { verification: '' },
        { verification: 123456 }
      ]
      error_params.map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/verify')
            .send(testCase)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      it('it should fail because verification is wrong', (done) => {
        chai
          .request(server.httpServer)
          .post('/verify')
          .send({ verification: 'verification error' })
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('NOT_FOUND_OR_ALREADY_VERIFIED')
            done()
        })
      })
      
      it('it should fail beacause is already verified', (done) => {
        chai
          .request(server.httpServer)
          .post('/verify')
          .send({ verification })
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('NOT_FOUND_OR_ALREADY_VERIFIED')
            done()
        })
      })
    })

    describe('*********** /POST forgot password ***********', () => {
      it('it should request forgot password successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/forgot')
          .send({ email: 'user1@test.com' })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('RESET_EMAIL_SENT')
            done()
        })
      })

      const error_params = [
        {},
        { email: '' },
        { email: 123 },
        { email: 'test' },
        { email: '@test.com' },
        { email: 'user1@test' }
      ]

      error_params.map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/forgot')
            .send(testCase)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })

      it('it should fail because user email does not exist', (done) => {
        chai
          .request(server.httpServer)
          .post('/forgot')
          .send({ email: 'validemailnotcreated@test.com' })
          .end((_, res) => {
            res.should.have.status(404)
            res.body.should.have.property('msg').eql('USER_NOT_FOUND')
            done()
        })
      })
    })
    
    describe('*********** /POST reset password ***********', () => {

      let verification = ''

      before(async () => {
        try {
          const forgot = await Forgot.findOne({ email: 'user1@test.com' })
          verification = forgot.verification
        } catch (err) {
          console.log(err.message)
        }
      })

      it('it should reset password successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/reset')
          .send({ verification, newPassword: '123457' })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('msg').eql('PASSWORD_CHANGED')
            done()
        })
      })
      it('it should login successfully with new password', (done) => {
        chai
          .request(server.httpServer)
          .post('/login')
          .send({ email: 'user1@test.com', password: '123457' })
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('token')
            res.body.should.have.property('user')
            done()
        })
      })
      
      const empty_params = [
        {},
        { verification: '', newPassword: '' },
        { verification: '123456', newPassword: '' },
        { verification: '', newPassword: '123456' }
      ]
      const invalid_params = [
        { verification: 123456, newPassword: '123456' },
        { verification: '123456', newPassword: 123456 },
        { verification: '123456', newPassword: '12345' },
      ]
      empty_params.concat(invalid_params).map(testCase => {
        it('it should fail since some data was empty or invalid', (done) => {
          chai
            .request(server.httpServer)
            .post('/reset')
            .send(testCase)
            .end((_, res) => {
              res.should.have.status(400)
              res.body.should.have.property('msg')
              done()
            })
        })
      })
    })

    describe('*********** /POST refresh token ***********', () => {
      it('it should generate a new token successfully', (done) => {
        chai
          .request(server.httpServer)
          .post('/token')
          .set('Authorization', token)
          .end((_, res) => {
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('token')
            res.body.should.have.property('user')
            done()
        })
      })

      it('it should fail because no token was sent', (done) => {
        chai
          .request(server.httpServer)
          .post('/token')
          .end((_, res) => {
            res.should.have.status(401)
            res.body.should.have.property('msg')
            done()
        })
      })
    })
})
