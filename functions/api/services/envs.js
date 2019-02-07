'use strict'
module.exports = (repository) => {
  return {
    getLatest: async () => {
      return repository.getLatest()
    },
    put: async (env) => {
      return repository.put(env)
    }
  }
}
