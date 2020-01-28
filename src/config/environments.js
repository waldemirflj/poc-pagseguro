const {
  NODE_ENV,

  PAGSEGURO_WS,
  PAGSEGURO_EMAIL,
  PAGSEGURO_TOKEN,
  PAGSEGURO_NOTIFICATION,

  PAGSEGURO_SANDBOX_WS,
  PAGSEGURO_SANDBOX_EMAIL,
  PAGSEGURO_SANDBOX_TOKEN,
  PAGSEGURO_SANDBOX_NOTIFICATION
} = process.env

const PAG_WS = NODE_ENV === 'development'
  ? PAGSEGURO_SANDBOX_WS
  : PAGSEGURO_WS

const PAG_EMAIL = NODE_ENV === 'development'
  ? PAGSEGURO_SANDBOX_EMAIL
  : PAGSEGURO_EMAIL

const PAG_TOKEN = NODE_ENV === 'development'
  ? PAGSEGURO_SANDBOX_TOKEN
  : PAGSEGURO_TOKEN

const PAG_NOTIFICATION = NODE_ENV === 'development'
  ? PAGSEGURO_SANDBOX_NOTIFICATION
  : PAGSEGURO_NOTIFICATION

const PROD = NODE_ENV === 'development'
  ? false
  : true

console.info(`---`)
console.info(`PROD: ${PROD}`)
console.info(`NODE_ENV: ${NODE_ENV}`)

console.info(`---`)
console.info(`PAG_WS: ${PAG_WS}`)
console.info(`PAG_EMAIL: ${PAG_EMAIL}`)
console.info(`PAG_TOKEN: ${PAG_TOKEN}`)
console.info(`PAG_NOTIFICATION: ${PAG_NOTIFICATION}`)

module.exports = {
  PROD,
  PAG_WS,
  PAG_EMAIL,
  PAG_TOKEN,
  PAG_NOTIFICATION
}
