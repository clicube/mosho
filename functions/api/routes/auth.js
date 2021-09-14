'use strict'
const auth = require('basic-auth')
module.exports = (config) => {
  const checkBasicAuth = (req) => {
    const user = auth(req)
    if (user) {
      return user && user.name === config.name && user.pass === config.pass
    } else {
      return undefined
    }
  }

  const checkPasscode = (req) => {
    if (req.body.passcode) {
      return req.body.passcode === config.passcode
    } else {
      return undefined
    }
  }

  const fail = (res) => {
    return res.status(401).send({ result: 'NG', message: 'Unauthorized' })
  }

  return {
    basicAuth: (req, res, next) => {
      if (checkBasicAuth(req)) {
        return next()
      } else {
        return fail(res)
      }
    },
    passcodeOrBasicAuth: (req, res, next) => {
      const basicAuthResult = checkBasicAuth(req)
      const passcodeResult = checkPasscode(req)
      if (!basicAuthResult && !passcodeResult) {
        return fail(res)
      } else if (basicAuthResult === false || passcodeResult === false) {
        return fail(res)
      } else {
        return next()
      }
    },
  }
}
