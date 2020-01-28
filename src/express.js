const { ASSETS_DIR } = process.env

const path = require('path')
const express = require('express')
const routes = require('./routes')

const server = express()
  .set('view engine', 'ejs')
  .set('views', path.join(__dirname, 'views'))
  .use('/assets', express.static(ASSETS_DIR))
  .use(express.urlencoded({ extended: false }))
  .use(express.json())
  .use(routes)

module.exports = server
