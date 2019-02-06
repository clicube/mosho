'use strict'
module.exports = (repository) => {
  return {
    getLatest: async () => {
      return await repository.getLatest()
    },
    put: async (env) => {
      return await repository.put(env)
    },
  }
}