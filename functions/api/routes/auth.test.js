/* eslint-env jest */
'use strict'
const auth = require('./auth')
const request = require('supertest')
const express = require('express')

const createTestApp = () => {
  const app = express()
  const config = { name: 'name', pass: 'pass' }
  const sut = auth(config)
  app.use(sut.basicAuth)
  app.get('/', (req, res) => {
    res.send('ok')
  })
  return app
}

test('basicAuth accept correct name and pass', async () => {
  // arrange
  const app = createTestApp()

  // act
  const result = await request(app).get('/').auth('name', 'pass')

  // assert
  expect(result.status).toBe(200)
  expect(result.text).toBe('ok')
})

test('basicAuth rejects wrong name', async () => {
  // arrange
  const app = createTestApp()

  // act
  const result = await request(app).get('/').auth('wrong-name', 'pass')

  // assert
  expect(result.status).toBe(401)
})

test('basicAuth rejects wrong pass', async () => {
  // arrange
  const app = createTestApp()

  // act
  const result = await request(app).get('/').auth('name', 'wrong-pass')

  // assert
  expect(result.status).toBe(401)
})
