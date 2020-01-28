const qs = require('qs')
const request = require('request-promise')
const xml2json = require('xml2json')

const {
  PAG_WS,
  PAG_EMAIL,
  PAG_TOKEN } = require('../../config/environments')

class NotificarionController {
  async store (req, res) {
    console.info('notificação')
    console.info(req.query)

    res.status(200)
      .json({  })
  }

  async index (req, res) {
    const { notificationCode } = req.params

    const queryParams = qs.stringify({
      email: PAG_EMAIL,
      token: PAG_TOKEN,
    })

    const resp = await request.get({
      url: `${PAG_WS}/v3/transactions/notifications/${notificationCode}/?${queryParams}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const { transaction: { code, status }} = JSON.parse(xml2json.toJson(resp))

    res.status(200)
      .json({
        code,
        status,
        notificationCode
      })
  }
}

module.exports = new NotificarionController()
