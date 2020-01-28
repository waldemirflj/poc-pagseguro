const {
  PROD,
  PAG_WS,
  PAG_EMAIL,
  PAG_TOKEN } = require('../../config/environments')

const qs = require('qs')
const request = require('request-promise')
const xml2json = require('xml2json')

class HomeController {
  async index (req, res) {
    try {
      const queryParams = qs.stringify({
        email: PAG_EMAIL,
        token: PAG_TOKEN,
      },{
        charset: 'utf-8'
      })

      const resp = await request.post(`${PAG_WS}/sessions?${queryParams}`)
      const { session: { id } } = JSON.parse(xml2json.toJson(resp))

      res.render('home/index', {
        prod: PROD,
        amount: 1.99,
        session: id
      })
    } catch (error) {
      console.log('error')
      console.log(error)
    }
  }
}

module.exports = new HomeController()
