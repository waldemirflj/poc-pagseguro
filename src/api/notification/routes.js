const Router = require('express').Router()
const controller = require('./notification.controller')

const routes = Router
  .post('/', controller.store)

module.exports = routes
