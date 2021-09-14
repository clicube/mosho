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
    },
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
    },
  }
  const sut = envs(mockService, {})
  app.use(sut)

  // act
  const result = await request(app).get('/latest')

  // assert
  expect(result.status).toBe(500)
})

const createApp = () => {
  const app = express()
  app.use(express.urlencoded({ extended: true }))
  const mockService = {
    put: async (data) => {
      return data
    },
  }
  const sut = envs(mockService, { name: 'name', pass: 'pass' })
  app.use(sut)
  return app
}

test('POST / with correct basic auth and data returns 200 and received data', async () => {
  // arrange
  const app = createApp()

  // act
  const result = await request(app)
    .post('/')
    .auth('name', 'pass')
    .send('time=11111111&temperature=22&humidity=33&brightness=44')

  // assert
  expect(result.status).toBe(200)
  const parsedResult = JSON.parse(result.text)
  expect(parsedResult.time).toBe(11111111)
  expect(parsedResult.temperature).toBe(22)
  expect(parsedResult.humidity).toBe(33)
  expect(parsedResult.brightness).toBe(44)
})

test('POST / with correct basic auth but wrong data returns 400 response', async () => {
  // arrange
  const app = createApp()

  // act
  const result = await request(app)
    .post('/')
    .auth('name', 'pass')
    .send('time=xxx&temperature=22&humidity=33&brightness=44')

  // assert
  expect(result.status).toBe(400)
})

test('POST / with correct basic auth but insufficient data returns 400 response', async () => {
  // arrange
  const app = createApp()

  // act
  const result = await request(app)
    .post('/')
    .auth('name', 'pass')
    .send('time=111&temperature=22&humidity=33')

  // assert
  expect(result.status).toBe(400)
})

test('POST / with wrong basic auth returns 401 response', async () => {
  // arrange
  const app = createApp()

  // act
  const result = await request(app)
    .post('/')
    .auth('name', 'wrong-pass')
    .send('time=11111111&temperature=22&humidity=33&brightness=44')

  // assert
  expect(result.status).toBe(401)
})
