const Router = require('express').Router()
const transactionRoutes = require('./transaction/routes')
const notificationRoutes = require('./notification/routes')

const routes = Router
  .use('/transaction', transactionRoutes)
  .use('/notification', notificationRoutes)


module.exports = routes
