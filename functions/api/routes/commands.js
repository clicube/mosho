'use strict'
module.exports = (service, authConfig) => {
  const auth = require('./auth')(authConfig)
  const router = require('express-promise-router')()

  router.get('/', async (req, res) => {
    const commands = await service.getAll()
    res.json(commands)
  })

  router.post('/', auth.passcodeOrBasicAuth, async (req, res) => {
    const docData = {
      command: req.body.command,
    }
    if (docData.command === undefined) {
      return res.status(400).send({ result: 'NG', message: 'Bad Request' })
    }
    const result = await service.put(docData)
    return res.json(result)
  })

  router.delete('/:id', auth.basicAuth, async (req, res) => {
    await service.delete(Number(req.param('id')))
    return res.json({ result: 'OK' })
  })

  return router
}
