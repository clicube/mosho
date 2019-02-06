'use strict'
const functions = require('firebase-functions')
const api = require('./api/app')

exports.api = functions.runWith({ timeoutSeconds: 10 }).region('asia-northeast1').https.onRequest(api)
