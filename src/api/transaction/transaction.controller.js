const qs = require('qs')
const request = require('request-promise')
const xml2json = require('xml2json')

const {
  PAG_WS,
  PAG_EMAIL,
  PAG_TOKEN } = require('../../config/environments')

const paymentDTO = ({ body }) => {
  const {
    dd,
    cpf,
    name,
    email,
    telefone,
    dataDeNascimento,

    endereco,
    numero,
    bairro,
    cep,
    cidade,
    estado,

    type,
    senderHash,
    paymentMethod,
    creditCardToken
  } = body

  const senderAreaCode = dd || ''
  const senderCPF = cpf || ''
  const reference = cpf || ''
  const senderName = name || ''
  const senderEmail = email || ''
  const senderPhone = telefone || ''

  const queryParams = qs.stringify({
    email: PAG_EMAIL,
    token: PAG_TOKEN,
  })

  const data = {
    paymentMode: 'default',
    paymentMethod,
    currency: 'BRL',
    extraAmount: '00.00',
    itemId1: '000001',
    itemDescription1: 'Compra de teste',
    itemAmount1: '1.99',
    itemQuantity1: '1',
    reference,
    senderName,
    senderCPF,
    senderAreaCode,
    senderPhone,
    senderEmail,
    senderHash,
    shippingAddressRequired: false,
    notificationURL: 'http://localhost:3000/api/notification'
  }

  if (type === 1) {
    data.creditCardToken = creditCardToken
    data.installmentQuantity = 1
    data.installmentValue = '1.99'
    data.noInterestInstallmentQuantity = 2

    data.creditCardHolderName = senderName
    data.creditCardHolderCPF = senderCPF
    data.creditCardHolderAreaCode = senderAreaCode
    data.creditCardHolderPhone = senderPhone
    data.creditCardHolderBirthDate = dataDeNascimento

    data.billingAddressStreet = endereco
    data.billingAddressNumber = numero
    data.billingAddressComplement = ''
    data.billingAddressDistrict = bairro
    data.billingAddressPostalCode = cep
    data.billingAddressCity = cidade
    data.billingAddressState = estado
    data.billingAddressCountry = 'BRA'
  }

  return {
    url: `${PAG_WS}/v2/transactions/?${queryParams}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: data
  }
}

const paymentByBoleto = async ({ body }) => {
  try {
    const data = Object.assign(body, {
      paymentMethod: 'boleto'
    })

    const options = paymentDTO({ body: data })
    const resp = await request.post({ ...options })
    const { transaction: { code, paymentLink }} = JSON.parse(xml2json.toJson(resp))

    return {
      data: {
        code,
        paymentLink
      }
    }
  } catch (error) {
    const { error: err } = error
    const { errors: { error: errr } } = JSON.parse(xml2json.toJson(err))

    return {
      error: true,
      errors: errr
    }
  }
}

const paymentByCreditCard = async ({ body }) => {
  try {
    const data = Object.assign(body, {
      paymentMethod: 'creditCard'
    })

    const options = paymentDTO({ body: data })
    const resp = await request.post({ ...options })
    const { transaction: { date, code, status }} = JSON.parse(xml2json.toJson(resp))

    return {
      data: {
        date,
        code,
        status
      }
    }
  } catch (error) {
    const { error: err } = error
    const { errors: { error: errr } } = JSON.parse(xml2json.toJson(err))

    return {
      error: true,
      errors: errr
    }
  }
}

class TransactionController {
  async store (req, res) {
    const { type } = req.body
    const body = req.body
    const paymentOptions = [1, 2]

    if (!paymentOptions.includes(type)) {
      res.status(400)
        .json({
          error: true,
          errors: [{
            code: 400,
            message: 'sender type is required.'
          }]
        })
    }

    const { data , error, errors } =  type === 1
      ? await paymentByCreditCard({ body })
      : await paymentByBoleto({ body })

      if (error) {
        const arr = Array.isArray(errors)
          ? errors
          : [errors]

        return res.status(400)
          .json({
            error,
            errors: arr
          })
      }

    res.status(200)
      .json({ ...data })
  }
}

module.exports = new TransactionController()
