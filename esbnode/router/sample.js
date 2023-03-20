//处理样品信息相关的后端逻辑
const express = require('express')
const Result = require('../models/Result')
const Sample = require('../models/Sample')
const sampleService = require('../service/sample')
const { decoded } = require('../utils')
//express-validator，表单验证器，简化POST请求的参数验证
const { body, validationResult } = require('express-validator')
const boom = require('boom')

const router = express.Router()

//获取样品种类信息
router.get('/category', function(req, res, next) {
  sampleService.getCategory().then(category => {
    new Result(category, '获取分类成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})
//获取样品信息
router.get('/list', function(req, res, next) {
  sampleService.listSample(req.query)
    .then(({ list, count, page, pageSize }) => {
      new Result({ list, count, page: +page, pageSize: +pageSize },
        '获取样品列表成功').success(res)
    }).catch(err => {
    next(boom.badImplementation(err))
  })
})
//删除某一样品信息
router.get('/delete', function(req, res, next) {
  const { idsamples } = req.query
  if (!idsamples) {
    next(boom.badRequest(new Error('参数样品ID不能为空')))
  } else {
      sampleService.deleteSample(idsamples).then(() => {
      new Result('删除样品信息成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})
//添加新的样品信息
router.post(
  '/create',
  function(req, res, next) {
    const decode = decoded(req)
    if (decode && decode.username) {
      req.body.username = decode.username
    }
    const sample = new Sample(req.body)
    sampleService.insertSample(sample).then(() => {
      new Result('添加样品信息成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
)
//更新某一样品信息
router.post(
  '/update',
  function(req, res, next) {
    const decode = decoded(req)
    if (decode && decode.username) {
      req.body.username = decode.username
    }
    const sample = new Sample(req.body)
    console.log('update' + sample.idsamples)
    sampleService.updateSample(sample).then(() => {
      new Result('更新样品信息成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
)
//
router.get('/get', function(req, res, next) {
  const { idsamples } = req.query
  if (!idsamples) {
    next(boom.badRequest(new Error('参数样品编号不能为空')))
  } else {
    sampleService.getSample(idsamples).then(book => {
      new Result(book, '获取样品信息成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})

module.exports = router
