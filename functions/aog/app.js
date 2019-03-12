'use strict'
// const express = require('express')
const admin = require('firebase-admin')
// const functions = require('firebase-functions')
// admin.initializeApp(functions.config().firebase)
const firestore = admin.firestore()

const commandsRepository = require('../api/repositories/commands')
const commandsService = require('../api/services/commands')

const commands = (() => {
  const repository = commandsRepository(firestore)
  return commandsService(repository)
})()

const { smarthome } = require('actions-on-google')
const app = smarthome()

const devices = [
  {
    id: '1',
    type: 'action.devices.types.LIGHT',
    traits: [
      'action.devices.traits.OnOff'
      // 'action.devices.traits.Brightness',
      // 'action.devices.traits.ColorTemperature',
      // 'action.devices.traits.ColorSpectrum'
    ],
    name: {
      name: 'リビングの照明'
    },
    willReportState: false,
    roomHint: 'リビング',
    attributes: {
      commandOnlyOnOff: true
    }
  }]

app.onSync((body, headers) => {
  console.log(headers)
  console.log(body)
  return {
    requestId: body.requestId,
    payload: {
      agentUserId: 'dummy',
      devices: devices
    }
  }
})

app.onQuery((body, headers) => {
  console.log(headers)
  console.log(body)
  return {
    requestId: body.requestId,
    payload: {
      devices: {
        1: {
          online: true
        }
      }
    }
  }
})

app.onExecute((body, headers) => {
  console.log(headers)
  console.log(body)
  const on = body.inputs[0].payload.commands[0].execution[0].params.on
  if (on) {
    commands.put({
      command: 'light-on-full'
    })
  } else {
    commands.put({
      command: 'light-off'
    })
  }
  return {
    requestId: body.requestId,
    payload: {
      commands: [
        {
          ids: ['1'],
          status: 'SUCCESS',
          states: {
            online: true
          }
        }
      ]
    }
  }
})

app.onDisconnect((body, headers) => {
  console.log(headers)
  console.log(body)
  return {}
})

module.exports = app
