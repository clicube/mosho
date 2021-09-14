/* eslint-env jest */
'use strict'
const envs = require('./envs')

test('getLatest() returns latest data from repository', async () => {
  // arrange
  const mockRepo = {
    getLatest: async () => {
      return 'latestData'
    },
  }
  const sut = envs(mockRepo)

  // act
  const result = await sut.getLatest()

  // assert
  expect(result).toBe('latestData')
})

test('getLatest() raises error when repository occurs error', async () => {
  // arrange
  const mockRepo = {
    getLatest: async () => {
      throw new Error()
    },
  }
  const sut = envs(mockRepo)

  // act, assert
  try {
    await sut.getLatest()
    expect(true).toBe(false)
  } catch (e) {
    expect(e instanceof Error).toBe(true)
  }
})
