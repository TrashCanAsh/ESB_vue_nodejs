const express = require('express')
const router = require('./router')
const fs = require('fs')
const https = require('https')
const bodyParser = require('body-parser')
const cors = require('cors')
const { HTTPS_PATH } = require('./utils/constant')

// 创建 express 应用
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', router)

const privateKey = fs.readFileSync(HTTPS_PATH + '/https/9567566_hias-esb.xyz.key', 'utf8')
const certificate = fs.readFileSync(HTTPS_PATH + '/https/9567566_hias-esb.xyz.pem', 'utf8')
const credentials = { key: privateKey, cert: certificate }
const httpsServer = https.createServer(credentials, app)
const SSLPORT = 18082
const server = app.listen(8080, function() {
  const { address, port } = server.address()
  console.log('HTTP服务启动成功：http://%s:%s', address, port)
})
httpsServer.listen(SSLPORT, function() {
  console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT)
})