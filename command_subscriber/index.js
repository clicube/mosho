const admin = require('firebase-admin')
const childProcess = require('child_process')
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()
const query = db.collection('commands')

var prevCount = 0

const kickScript = () => {
  try {
    console.log('executing onPutCommand.sh ...')
    const execSync = childProcess.execSync
    const result = execSync('bash onPutCommand.sh')
    console.log(result.toString())
  } catch (e) {
    console.error(e)
  }
}

query.onSnapshot(querySnapshot => {
  const newCount = querySnapshot.size
  console.log('command count: ' + newCount)
  if (prevCount < newCount) {
    kickScript()
  }
  prevCount = newCount
}, err => {
  console.log(`Encountered error: ${err}`)
});