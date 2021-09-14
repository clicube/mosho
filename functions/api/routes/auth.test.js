/* eslint-env jest */
'use strict'
const auth = require('./auth')
const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')

const createTestApp = (testAuth) => {
  const app = express()
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(testAuth)
  app.get('/', (req, res) => {
    res.send('ok')
  })
  app.post('/', (req, res) => {
    res.send('ok')
  })
  return app
}

const createTestAppBasic = () => {
  const config = { name: 'name', pass: 'pass' }
  const sut = auth(config)
  return createTestApp(sut.basicAuth)
}

const createTestAppPassOrBasic = () => {
  const config = { name: 'name', pass: 'pass', passcode: '1111' }
  const sut = auth(config)
  return createTestApp(sut.passcodeOrBasicAuth)
}

test('basicAuth accepts correct name and pass', async () => {
  // arrange
  const app = createTestAppBasic()

  // act
  const result = await request(app).get('/').auth('name', 'pass')

  // assert
  expect(result.status).toBe(200)
  expect(result.text).toBe('ok')
})

test('basicAuth rejects wrong name', async () => {
  // arrange
  const app = createTestAppBasic()

  // act
  const result = await request(app).get('/').auth('wrong-name', 'pass')

  // assert
  expect(result.status).toBe(401)
})

test('basicAuth rejects wrong pass', async () => {
  // arrange
  const app = createTestAppBasic()

  // act
  const result = await request(app).get('/').auth('name', 'wrong-pass')

  // assert
  expect(result.status).toBe(401)
})

test('basicAuth rejects without basic auth header', async () => {
  // arrange
  const app = createTestAppBasic()

  // act
  const result = await request(app).get('/')

  // assert
  expect(result.status).toBe(401)
})

test('passcodeOrBasicAuth accepts correct passcode without basic auth', async () => {
  // arrange
  const app = createTestAppPassOrBasic()

  // act
  const result = await request(app).post('/').send('passcode=1111')

  // assert
  expect(result.status).toBe(200)
  expect(result.text).toBe('ok')
})

test('passcodeOrBasicAuth accepts correct basic auth without passcode', async () => {
  // arrange
  const app = createTestAppPassOrBasic()

  // act
  const result = await request(app).post('/').auth('name', 'pass')

  // assert
  expect(result.status).toBe(200)
  expect(result.text).toBe('ok')
})

test('passcodeOrBasicAuth rejects correct passcode with wrong basic auth', async () => {
  // arrange
  const app = createTestAppPassOrBasic()

  // act
  const result = await request(app)
    .post('/')
    .send('passcode=1111')
    .auth('name', 'wrong-pass')

  // assert
  expect(result.status).toBe(401)
})

test('passcodeOrBasicAuth rejects correct basic auth with wrong passcode', async () => {
  // arrange
  const app = createTestAppPassOrBasic()

  // act
  const result = await request(app)
    .post('/')
    .send('passcode=2222')
    .auth('name', 'pass')

  // assert
  expect(result.status).toBe(401)
})

test('passcodeOrBasicAuth rejects without basic auth and passcode', async () => {
  // arrange
  const app = createTestAppPassOrBasic()

  // act
  const result = await request(app)
    .post('/')
    .send('passcode=2222')
    .auth('name', 'pass')

  // assert
  expect(result.status).toBe(401)
})
