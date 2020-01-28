require('dotenv').config()
const path = require('path')

process.env.ASSETS_DIR = path.join(__dirname, './src/assets')

const {
  PORT,
  NODE_ENV } = process.env

const server = require('./src/express')

server
  .listen(PORT, () => {
    console.info(`---`)
    console.info(`server is running in ${NODE_ENV}: ${new Date()}`)
  })
