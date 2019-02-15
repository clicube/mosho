'use strict'
module.exports = (repository) => {
  return {
    getLatest: async () => repository.getLatest(),
    put: async (env) => repository.put(env)
  }
}
