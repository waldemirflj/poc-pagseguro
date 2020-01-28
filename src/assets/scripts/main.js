const paymentOptions = [
  1, // cartão de crédito
  2 // boleto
]

const creditCardOptions = [
  101, // visa
  102 // mastercard
]

const onSenderHashReady = () => new Promise((resolve, reject) => {
  PagSeguroDirectPayment.onSenderHashReady((response) => {
    const { status, message, senderHash } = response

    if(status === 'error') {
      reject({ message })
    }

    resolve({ senderHash })
  })
})

const getPaymentMethods = ({ amount }) => new Promise((resolve, reject) => {
  PagSeguroDirectPayment.getPaymentMethods({
    amount,
    success: ({ paymentMethods }) => resolve({ paymentMethods }),
    error: (error) => reject({ isError: true, error  })
  })
})

const createCardToken = ({ params }) => new Promise((resolve, reject) => {
  PagSeguroDirectPayment.createCardToken({
    ...params,
    success: ({ card: { token } }) => resolve({ token }),
    error: ({ error, errors }) => {
      const [ code ] = Object.keys(errors)

      reject({
        error,
        errors: [{
          code,
          message: errors[code]
        }]
      })
    },
  })
})

const getInstallments = ({ amount, brand }) => new Promise((resolve, reject) => {
  PagSeguroDirectPayment.getInstallments({
    brand,
    amount,
    maxInstallmentNoInterest: 2,
    success: ({ installments }) => resolve({ installments }),
    error: (error) => resolve({ error: true })
  })
})

const filtersPaymentMethods = ({ data }) => Object.keys(data)
  .map((k) => data[k])
  .filter((options) => paymentOptions.includes(options.code))

const filtersCreditCard = ({ data }) => Object.keys(data)
  .map((k) => data[k])
  .filter((options) => creditCardOptions.includes(options.code) && options.status === 'AVAILABLE')

const dataDTO = ({ data }) => {
  const { code, options } = data

  const obj = {
    error: false
  }

  if (code === 2) {
    if (options[data.name].status !== 'AVAILABLE') {
      obj.error = true
      obj.message = 'payment unavailable.'
    }
  } else {
    obj.data = filtersCreditCard({ data: options })
  }

  return obj
}

const paymentByCreditCard = ({ type }) => {
  const btn = document.getElementById('btnPaymentByCreditCard')
  const brand = document.getElementById('inputBrand')
  const cardNumber = document.getElementById('inputCardNumber')
  const expirationMonth = document.getElementById('inputExpirationMonth')
  const expirationYear = document.getElementById('inputExpirationYear')
  const cvv = document.getElementById('inputCVV')

  const dd = document.getElementById('inputDD')
  const cpf = document.getElementById('inputCPF')
  const name = document.getElementById('inputName')
  const email = document.getElementById('inputEmail')
  const telefone = document.getElementById('inputTelefone')
  const dataDeNascimento = document.getElementById('inputDataDeNascimento')

  const endereco = document.getElementById('inputEndereco')
  const numero = document.getElementById('inputNumero')
  const bairro = document.getElementById('inputBairro')
  const cep = document.getElementById('inputCEP')
  const cidade = document.getElementById('inputCidade')
  const estado = document.getElementById('inputEstado')

  btn.addEventListener('click', async (e) => {
    const dataCreditCard = {
      type,
      brand: `${brand.value}`.toLocaleLowerCase(),
      cardNumber: cardNumber.value,
      expirationMonth: expirationMonth.value,
      expirationYear: expirationYear.value,
      cvv: cvv.value
    }

    const element = document.getElementById('entry-template-containerCartaoDeCreditoFallback').innerHTML
    const parse = Handlebars.compile(element)

    try {
      const { token: creditCardToken } = await createCardToken({
        params: dataCreditCard
      })

      // const { error, installments } = await getInstallments({
      //   brand: `${brand.value}`.toLocaleLowerCase(),
      //   amount: '1.99'
      // })

      // if (error) {
      //   document.getElementById('container').innerHTML = parse({
      //     error: true,
      //     errors: [{
      //       code: '10004',
      //       message: 'the invalid means of payment.'
      //     }]
      //   })
      // }

      const { senderHash } = await onSenderHashReady()

      const body = JSON.stringify({
        dd: dd.value,
        cpf: cpf.value,
        name: name.value,
        email: email.value,
        telefone: telefone.value,
        dataDeNascimento: dataDeNascimento.value,

        endereco: endereco.value,
        numero: numero.value,
        bairro: bairro.value,
        cep: cep.value,
        cidade: cidade.value,
        estado: estado.value,

        type,
        senderHash,
        creditCardToken
      })

      const response = await fetch('/api/transaction', {
        body,
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      const json = await response.json()
      const { error, errors, date, code, status } = json

      if (error) {
        return document.getElementById('container').innerHTML = parse({
          error,
          errors
        })
      }

      document.getElementById('container').innerHTML = parse({
        date,
        code,
        status
      })
    } catch ({ error, errors }) {
      document.getElementById('container').innerHTML = parse({
        error,
        errors
      })
    }
  })
}

const paymentByBoleto = ({ type }) => {
  const btn = document.getElementById('btnPaymentByBoleto')
  const dd = document.getElementById('inputDD')
  const cpf = document.getElementById('inputCPF')
  const name = document.getElementById('inputName')
  const email = document.getElementById('inputEmail')
  const telefone = document.getElementById('inputTelefone')

  btn.addEventListener('click', async (e) => {
    const { senderHash } = await onSenderHashReady()

    const body = JSON.stringify({
      type,
      dd: dd.value,
      cpf: cpf.value,
      name: name.value,
      email: email.value,
      telefone: telefone.value,
      senderHash
    })

    const params = {
      body,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

    const element = document.getElementById('entry-template-containerBoletoFallback').innerHTML
    const parse = Handlebars.compile(element)

    fetch('/api/transaction', { ...params })
      .then(response => response.json())
      .then(({ error, errors, code, paymentLink }) => {
        if (error) {
          return document.getElementById('container').innerHTML = parse({
            error,
            errors
          })
        }

        document.getElementById('container').innerHTML = parse({
          code,
          paymentLink
        })
      })
  })
}

const container = ({ data, container }) => {
  const context = dataDTO({ data })
  const element = document.getElementById(`entry-template-${container}`).innerHTML
  const parse = Handlebars.compile(element)

  document.getElementById('container').innerHTML = parse(context)

  if (data.code === 1) {
    paymentByCreditCard({ type: data.code })
    return
  }

  paymentByBoleto({ type: data.code })
}

window.onload = async () => {
  const body = document.getElementById('body')
  const amount = body.getAttribute('amount')
  const session = body.getAttribute('data-session')
  const btnBoleto = document.getElementById('btnBoleto')
  const btnCreditCard = document.getElementById('btnCreditCard')

  // define o código de sessão obtido no backend
  PagSeguroDirectPayment.setSessionId(session)

  // retorna os meios de pagamento disponíveis
  const { isError, error, paymentMethods } = await getPaymentMethods({ amount })

  if (isError) {
    console.log('getPaymentMethods: error')
    console.log(error)
    return
  }

  const [ boleto, cartaoDeCredito ] = filtersPaymentMethods({ data: paymentMethods })

  btnBoleto.addEventListener('click', (e) => container({
    data: boleto,
    container: 'containerBoleto'
  }))

  btnCreditCard.addEventListener('click', (e) => container({
    data: cartaoDeCredito,
    container: 'containerCartaoDeCredito'
  }))
}
