'use strict'
const functions = require('firebase-functions')
const api = require('./api/app')
const aog = require('./aog/app')

exports.api = functions
  .runWith({ timeoutSeconds: 10 })
  .region('asia-northeast1')
  .https.onRequest(api)
exports.aog = functions
  .runWith({ timeoutSeconds: 10 })
  .region('asia-northeast1')
  .https.onRequest(aog)
