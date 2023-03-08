//处理样品信息相关的后端逻辑
const express = require('express')
const Result = require('../models/Result')
const sampleService = require('../service/sample')
//express-validator，表单验证器，简化POST请求的参数验证
const { body, validationResult } = require('express-validator')
const boom = require('boom')

const router = express.Router()

router.get('/category', function(req, res, next) {
    sampleService.getCategory().then(category => {
      new Result(category, '获取分类成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  })
  
  router.get('/list', function(req, res, next) {
    sampleService.listSample(req.query)
      .then(({ list, count, page, pageSize }) => {
        new Result({ list, count, page: +page, pageSize: +pageSize },
          '获取样品列表成功').success(res)
      }).catch(err => {
      next(boom.badImplementation(err))
    })
  })
  
  router.get('/delete', function(req, res, next) {
    const { fileName } = req.query
    if (!fileName) {
      next(boom.badRequest(new Error('参数fileName不能为空')))
    } else {
        sampleService.deleteSample(fileName).then(() => {
        new Result('删除样品信息成功').success(res)
      }).catch(err => {
        next(boom.badImplementation(err))
      })
    }
  })
  
  module.exports = router
  