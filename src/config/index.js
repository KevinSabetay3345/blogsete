require('dotenv').config()

const env = process.env.NODE_ENV

const prod = {
  env: 'prod',
  server: {
    port: 3000
  },
  database: {
    url: process.env.DB_URL,
    properties: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'blog'
    }
  },
  jwt: {
    privateKey: process.env.JWT_SECRET,
    tokenExpireInSeconds: 1800
  },
  pagination: {
    defaultSkip: 0,
    defaultLimit: 10,
    maxSkip: 500,
    maxLimit: 50
  },
  auth: {
    loginAttempts: 6,
    hoursToBlock: 2,
    saltRounds: 10
  }
}

const dev = {
  env: 'dev',
  server: {
    port: 9000
  },
  database: {
    url: process.env.DB_URL,
    properties: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'blog-dev'
    }
  },
  jwt: {
    privateKey: process.env.JWT_SECRET,
    tokenExpireInSeconds: 1800
  },
  pagination: {
    defaultSkip: 0,
    defaultLimit: 10,
    maxSkip: 500,
    maxLimit: 50
  },
  auth: {
    loginAttempts: 6,
    hoursToBlock: 2,
    saltRounds: 10
  }
}

const test = {
  env: 'test',
  server: {
    port: 9001
  },
  database: {
    url: process.env.DB_URL,
    properties: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'blog-test'
    }
  },
  jwt: {
    privateKey: process.env.JWT_SECRET,
    tokenExpireInSeconds: 1800
  },
  pagination: {
    defaultSkip: 0,
    defaultLimit: 10,
    maxSkip: 500,
    maxLimit: 50
  },
  auth: {
    loginAttempts: 6,
    hoursToBlock: 2,
    saltRounds: 10
  }
}

const config = {
  prod,
  dev,
  test
}

module.exports = config[env]