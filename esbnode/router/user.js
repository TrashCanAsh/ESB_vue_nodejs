//处理用户相关的后端逻辑
const express = require('express')
const Result = require('../models/Result')
const { login, findUser, signup, isUserExist, queryLast } = require('../service/user')
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
      password = md5(password + '@' + username + '@' + PWD_SALT)

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
router.post(
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
      //密码MD5加盐处理
      password = md5(password + '@' + username + '@' + PWD_SALT)
      //查询用户名是否存在
      isUserExist(username).then(user => {
        if (user) {
          new Result('注册失败：用户名已存在').fail(res)
        } else {
          //获取用户表中最后一个用户的ID值，新用户的ID值为该值+1
          queryLast('user').then(result => {
            let num = 0
            //当用户表中没有数据时（result为null），则直接赋值为1
            num = +(result ? result.iduser : 0) + 1
            signup(username, password, num).then(result => {
              new Result('注册成功').success(res)
            })
          })
        }
      })
    }
  }
)

module.exports = router