'use strict'
module.exports = (service, authConfig) => {
  const auth = require('./auth')(authConfig)
  const router = require('express-promise-router')()

  router.get('/latest', async (req, res) => {
    const env = await service.getLatest()
    res.send(env)
  })

  router.post('/', auth.basicAuth, async (req, res) => {
    const docData = {
      time: Number(req.body.time),
      temperature: Number(req.body.temperature),
      humidity: Number(req.body.humidity),
      brightness: Number(req.body.brightness)
    }
    const err = []
    for (let key of Object.keys(docData)) {
      if (isNaN(docData[key])) {
        err.push(key + ' is invalid')
      }
    }
    if (err.length > 0) {
      err.unshift('Bad Request')
      return res.status(400).send({ status: 'NG', message: err.join(', ') })
    }
    return service.put(docData)
  })

  return router
}