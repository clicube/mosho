'use strict'
const auth = require('basic-auth')
module.exports = (config) => {
  return {
    basicAuth: (req, res, next) => {
      const user = auth(req)
      if (user && user.name === config.name && user.pass === config.pass) {
        return next()
      } else {
        return res.status(401)
          .send({ result: 'NG', message: 'Unauthorized' })
      }
    },
    passcodeOrBasicAuth: (req, res, next) => {
      if (req.body.passcode === config.passcode) {
        return next()
      } else {
        return this.basicAuth(req, res, next)
      }
    }
  }
}
