const express = require('express')
const japExpress = require('@d8corp/jap-express').default
const Api = require('./Api.js')

const port = 3000
const app = express()
const api = new Api()

app.use(express.static('static'))
app.post('/', japExpress(api))

app.listen(port, err => {
  if (err) {
    console.log('something bad happened', err)
  } else {
    console.log(`server is listening on ${port}`)
  }
})