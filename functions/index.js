const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const auth = require('basic-auth')

admin.initializeApp(functions.config().firebase)
const db = admin.firestore()
const envsRef = db.collection('envs')

const expressApp = (() => {
  const app = express()

  const basicAuth = (req, res, next) => {
    const [name, pass] = functions.config().mosho.basicauth.split(':')
    const user = auth(req)
    if (user && user.name === name && user.pass === pass) {
      return next()
    } else {
      return res.status(401).send({ result: 'NG', message: 'Unauthorized,' + user.pass })
    }
  }

  const passcodeOrBasicAuth = (req, res, next) => {
    const passcode = functions.config().mosho.passcode
    if (req.body.passcode === passcode) {
      return next()
    } else {
      return basicAuth(req, res, next)
    }
  }

  app.get('/v1/envs/latest', (req, res) => {
    envsRef.orderBy('time', 'desc').limit(1).get().then((envs) => {
      if (envs.empty) {
        return res.send({})
      } else {
        const env = envs.docs[0]
        const docData = env.data()
        return res.send(env.data())
      }
    })
  })

  app.post('/v1/envs', basicAuth)
  app.post('/v1/envs', (req, res) => {
    const docData = {
      time: Number(req.body.time),
      temperature: Number(req.body.temperature),
      humidity: Number(req.body.humidity),
      brightness: Number(req.body.brightness),
    }
    const err = []
    for (key of Object.keys(docData)) {
      if (isNaN(docData[key])) {
        err.push(key + ' is invalid')
      }
    }
    if (err.length > 0) {
      err.unshift('Bad Request')
      return res.status(400).send({ status: 'NG', message: err.join(', ') })
    }
    envsRef.add(docData).then(() => {
      res.send(docData)
    })

  })

  return app
})()

// Expose Express API as a single Cloud Function:
exports.api = functions.region('asia-northeast1').https.onRequest(expressApp)