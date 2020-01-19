const express = require('express')
const jap = require('jap-express')
const Api = require('./server/Api.js')

const port = 3000
const app = express()

app.use(express.static('client'))
app.post('/', jap(Api))

app.listen(port, err => {
  if (err) {
    console.log('something bad happened', err)
  } else {
    console.log(`server is listening on ${port}`)
  }
})