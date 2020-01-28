const Router = require('express').Router()
const homeRoutes = require('./home/routes')

const routes = Router
  .use('/', homeRoutes)

module.exports = routes
