const express = require('express')
const boom = require('boom')
const userRouter = require('./user')
const sampleRouter = require('./sample')
const {
  CODE_ERROR
} = require('../utils/constant')
const Result = require('../models/Result')
const jwtAuth = require('./jwt')

// 注册路由
const router = express.Router()
//引入jwt中间件
router.use(jwtAuth)

router.get('/', function(req, res) {
  res.send('欢迎进入后端')
})

// 用户相关业务逻辑处理
router.use('/user', userRouter)
// 样品信息相关业务逻辑处理
router.use('/sample', sampleRouter)

/**
 * 集中处理404请求的中间件
 * 注意：该中间件必须放在正常处理流程之后
 * 否则，会拦截正常请求
 */
router.use((req, res, next) => {
  next(boom.notFound('接口不存在'))
})

/**
 * 自定义路由异常处理中间件
 * 注意两点：
 * 第一，方法的参数不能减少
 * 第二，方法的必须放在路由最后
 */
router.use((err, req, res, next) => {
  //token过期异常
  if (err.name === 'UnauthorizedError') {
    new Result(null, 'token失效', {
      error: err.status,
      errorMsg: err.name
    }).expired(res.status(err.status))
  } else {
    //一般异常
    const msg = (err && err.message) || '系统错误'
    const statusCode = (err.output && err.output.statusCode) || 500;
    const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
    new Result(null, msg, {
      error: statusCode,
      errorMsg
    }).fail(res.status(statusCode))
  }
})

module.exports = router