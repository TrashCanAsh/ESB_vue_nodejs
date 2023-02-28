//处理用户相关的后端逻辑
const express = require('express')
const Result = require('../models/Result')
const { login, findUser } = require('../service/user')
//md5加密与加盐
const { md5, decode } = require('../utils')
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
//express-validator，表单验证器，简化POST请求的参数验证
const { body, validationResult } = require('express-validator')
const boom = require('boom')
//
const jwt = require('jsonwebtoken')

const router = express.Router()
//登录请求处理（/user/login）
router.post(
  '/login', 
  [
    //express-validator
    //验证表单参数正确性
    body('username').isString().withMessage('username类型不正确'),
    body('password').isString().withMessage('password类型不正确')
  ],
  function(req, res, next) {
    //表单参数异常处理
    const err = validationResult(req)
    if (!err.isEmpty()) {
      const [{ msg }] = err.errors
      next(boom.badRequest(msg))
    } else {
      //正常逻辑
      let { username, password } = req.body
      //密码MD5加盐处理
      password = md5(password + PWD_SALT)

      login(username, password).then(user => {
        if (!user || user.length === 0) {
          new Result('登录失败').fail(res)
        } else {
          //生成token
          const token = jwt.sign(
            { username },
            PRIVATE_KEY,
            { expiresIn: JWT_EXPIRED }
          )
          //登录成功，将生成的token返回
          new Result({ token }, '登录成功').success(res)
        }
      })
    }
  }
)
//登录请求用户信息（/user/info）
router.get('/info', function(req, res) {
  const decoded = decode(req)
  if (decoded && decoded.username) {
    findUser(decoded.username).then(user => {
      if (user) {
        user.roles = [user.role]
        new Result(user, '获取用户信息成功').success(res)
      } else {
        new Result('获取用户信息失败').fail(res)
      }
    })
  } else {
    new Result('用户信息解析失败').fail(res)
  }
})
//注册请求处理（/user/signup）
router.get(
  '/signup', 
  [
    //express-validator
    //验证表单参数正确性
    body('username').isString().withMessage('username类型不正确'),
    body('password').isString().withMessage('password类型不正确')
  ],
  function(req, res, next) {
    //表单参数异常处理
    const err = validationResult(req)
    if (!err.isEmpty()) {
      const [{ msg }] = err.errors
      next(boom.badRequest(msg))
    } else {
      //正常逻辑
      let { username, password } = req.body

      
    }
  }
)

module.exports = router