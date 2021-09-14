'use strict'
module.exports = (db) => {
  const envsRef = db.collection('envs')
  return {
    getLatest: async () => {
      const envs = await envsRef.orderBy('time', 'desc').limit(1).get()
      if (envs.empty) {
        return {}
      } else {
        return envs.docs[0].data()
      }
    },
    put: async (env) => {
      await envsRef.add(env)
      return env
    },
  }
}
