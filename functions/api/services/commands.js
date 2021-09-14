'use strict'
module.exports = (repository) => {
  return {
    getAll: async () => repository.getAll(),
    put: async (origCmd) => {
      const id = new Date().getTime()
      const cmd = Object.assign({ id: id }, origCmd)
      return repository.put(cmd)
    },
    delete: async (id) => repository.delete(id),
  }
}
