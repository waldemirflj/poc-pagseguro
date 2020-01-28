const Router = require('express').Router()
const controller = require('./transaction.controller')

const routes = Router
  .post('/', controller.store)

module.exports = routes
