const Router = require('express').Router()
const controller = require('./home.controller')

const routes = Router
  .get('/', controller.index)

module.exports = routes
