'use strict'
const express = require('express')
const cors = require('cors')
const admin = require('firebase-admin')
const functions = require('firebase-functions')

const envRepository = require('./repositories/envs')
const envsService = require('./services/envs')
const envsRoute = require('./routes/envs')

admin.initializeApp(functions.config().firebase)
const firestore = admin.firestore()

const authConfig = (() => {
  const [name, pass] = functions.config().mosho.basicauth.split(':')
  const passcode = functions.config().mosho.passcode
  return {
    name: name,
    pass: pass,
    passcode: passcode
  }
})()

const envs = (() => {
  const repository = envRepository(firestore)
  const service = envsService(repository)
  return envsRoute(service, authConfig)
})()

const app = express()
app.use(cors())
app.use('/v1/envs', envs)

module.exports = app
