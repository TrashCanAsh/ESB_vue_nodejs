const { expressjwt } = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')

const jwtAuth = expressjwt({
  secret: PRIVATE_KEY,
  credentialsRequired: true, // 设置为false就不进行校验了，游客也可以访问
  algorithms: ['HS256']
}).unless({
  path: [
    '/',
    '/user/login',
    '/user/signup'
  ], // 设置 jwt 认证白名单
})

module.exports = jwtAuth