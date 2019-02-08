/* eslint-env jest */
const envs = require('./envs')

test('getLatest_returns_repository#getLatest_result', async () => {
  // arrange
  const mockRepo = {
    getLatest: jest.fn().mockReturnValue('latestData')
  }
  const sut = envs(mockRepo)

  // act
  const result = await sut.getLatest()

  // assert
  expect(result).toBe('latestData')
})

test('getLatest_passes_repository#getLatest_error', async () => {
  // arrange
  const mockRepo = {
    getLatest: jest.fn().mockImplementation(async () => {
      throw new Error()
    })
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
