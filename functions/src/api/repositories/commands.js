'use strict'
module.exports = (db) => {
  const cmdsRef = db.collection('commands')
  return {
    getAll: async () => {
      const cmds = await cmdsRef.get()
      if (cmds.empty) {
        return []
      } else {
        return cmds.docs.map((cmd) => cmd.data())
      }
    },
    put: async (cmd) => {
      await cmdsRef.add(cmd)
      return cmd
    },
    delete: async (id) => {
      const cmdsToDelete = await cmdsRef.where('id', '==', id).get()
      cmdsToDelete.forEach((cmd) => cmd.ref.delete())
    },
  }
}
