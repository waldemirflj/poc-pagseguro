const qs = require('qs')
const request = require('request-promise')
const xml2json = require('xml2json')

const {
  PAG_WS,
  PAG_EMAIL,
  PAG_TOKEN } = require('../../config/environments')

const enumStatus = {
  1: 'aguardando pagamento',
  2: 'em análise',
  3: 'paga',
  4: 'disponível',
  5: 'em disputa',
  6: 'devolvida',
  7: 'cancelada',
  8: 'debitado',
  9: 'retenção temporária'
}

class NotificationController {
  async store (req, res) {
    const { notificationCode, notificationType } = req.body

    console.info('---')
    console.info('Notification')

    if (!notificationCode || notificationType !== 'transaction') {
      console.info('body without content')
      return res.status(400)
    }

    const queryParams = qs.stringify({
      email: PAG_EMAIL,
      token: PAG_TOKEN,
    })

    const resp = await request.get({
      url: `${PAG_WS}/v3/transactions/notifications/${notificationCode}/?${queryParams}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const { transaction: { date, code, status, reference }} = JSON.parse(xml2json.toJson(resp))

    if (!date, !code, !status, !reference) {
      console.info('transaction not found')
      return res.status(404)
    }

    console.info(JSON.stringify({
      date,
      code,
      status: enumStatus[status],
      reference
    }))
  }
}

module.exports = new NotificationController()
