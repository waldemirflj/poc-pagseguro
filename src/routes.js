const Router = require('express').Router()
const frontend = require('./frontend')
const api = require('./api')

const routes = Router
  .use('/', frontend)
  .use('/api', api)

module.exports = routes
