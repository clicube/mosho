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

const util = require('util')

const devices = [
  {
    id: '1',
    type: 'action.devices.types.LIGHT',
    traits: [
      'action.devices.traits.OnOff',
      'action.devices.traits.Brightness',
      'action.devices.traits.ColorSetting'
    ],
    name: {
      name: 'リビングの照明'
    },
    willReportState: false,
    roomHint: 'リビング',
    attributes: {
      commandOnlyOnOff: true,

      colorTemperatureRange: {
        temperatureMinK: 2000,
        temperatureMaxK: 5000
      },
      commandOnlyColorSetting: false
}
  }]

app.onSync((body, headers) => {
  console.log(headers)
  console.log(util.inspect(body, {depth: null}))
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
  console.log(util.inspect(body, {depth: null}))
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
  console.log(util.inspect(body, {depth: null}))

  var command
  switch (body.inputs[0].payload.commands[0].execution[0].command) {
    case "action.devices.commands.ColorAbsolute":
      const temperature = body.inputs[0].payload.commands[0].execution[0].params.color.temperature
      if(temperature > 3000) {
        command = 'light-on-full'
      } else {
        command = 'light-on-scene'
      }
      break
    case "action.devices.commands.BrightnessAbsolute":
      const brightness = body.inputs[0].payload.commands[0].execution[0].params.brightness
      if(brightness > 60) {
        command = 'light-on-full'
      } else if(brightness > 20){
        command = 'light-on-scene'
      } else if(brightness > 0) {
        command = 'light-on-night'
      } else {
        command = 'light-off'
      }
      break
  case "action.devices.commands.OnOff":
    const on = body.inputs[0].payload.commands[0].execution[0].params.on
    if (on) {
      command = 'light-on-full'
    } else {
      command = 'light-off'
    }
  }

  return commands.put({
    command: command
  }).then(() => {
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

})

app.onDisconnect((body, headers) => {
  console.log(headers)
  console.log(util.inspect(body, {depth: null}))
  return {}
})

module.exports = app
