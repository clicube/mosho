/* eslint-env jest */
'use strict'
const envs = require('./envs')
const request = require('supertest')
const express = require('express')

test('GET /latest returns latest data from service as JSON', async () => {
  // arrange
  const app = express()
  const mockService = {
    getLatest: async () => {
      return { foo: 'bar' }
    }
  }
  const sut = envs(mockService, {})
  app.use(sut)

  // act
  const result = await request(app).get('/latest')

  // assert
  expect(JSON.parse(result.text).foo).toBe('bar')
})

test('GET /latest returns 500 error when service occurs error', async () => {
  // arrange
  const app = express()
  const mockService = {
    getLatest: async () => {
      throw new Error()
    }
  }
  const sut = envs(mockService, {})
  app.use(sut)

  // act
  const result = await request(app).get('/latest')

  // assert
  expect(result.status).toBe(500)
})
