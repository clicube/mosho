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
  console.log(util.inspect(body, { depth: null }))
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
  console.log(util.inspect(body, { depth: null }))
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

app.onExecute(async (body, headers) => {
  console.log(headers)
  console.log(util.inspect(body, { depth: null }))

  const commandQueue = []
  switch (body.inputs[0].payload.commands[0].execution[0].command) {
    case 'action.devices.commands.ColorAbsolute': {
      const temperature = body.inputs[0].payload.commands[0].execution[0].params.color.temperature
      if (temperature > 3000) {
        commandQueue.push('light-on-full')
      } else {
        commandQueue.push('light-on-scene')
      }
      break
    }
    case 'action.devices.commands.BrightnessAbsolute': {
      const brightness = body.inputs[0].payload.commands[0].execution[0].params.brightness
      if (brightness > 90) {
        commandQueue.push('light-on-full')
      } else if (brightness > 50) {
        commandQueue.push('light-on-danran')
      } else if (brightness > 20) {
        commandQueue.push('light-on-kutsurogi')
      } else if (brightness > 0) {
        commandQueue.push('light-on-kutsurogi')
        // FIXME: 常夜灯点灯中は受信感度が下がるために無効化
        // commandQueue.push('light-on-memory-night')
      } else {
        commandQueue.push('light-off')
      }
      break
    }
    case 'action.devices.commands.OnOff': {
      const on = body.inputs[0].payload.commands[0].execution[0].params.on
      if (on) {
        commandQueue.push('light-on-danran')
      } else {
        commandQueue.push('light-off')
      }
    }
  }

  for (const i in commandQueue) {
    await commands.put({
      command: commandQueue[i]
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
  console.log(util.inspect(body, { depth: null }))
  return {}
})

module.exports = app
