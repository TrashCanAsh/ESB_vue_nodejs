import request from '../utils/request'

export function createSample(sample) {
  return request({
    url: '/sample/create',
    method: 'post',
    data: sample
  })
}

export function multiCreateSample(list) {
  return request({
    url: '/sample/multicreate',
    method: 'post',
    data: list
  })
}

export function updateSample(sample) {
  return request({
    url: '/sample/update',
    method: 'post',
    data: sample
  })
}

export function getSample(idsamples) {
  return request({
    url: '/sample/get',
    method: 'get',
    params: { idsamples }
  })
}

export function getCategory() {
  return request({
    url: '/sample/category',
    method: 'get'
  })
}

export function listSample(params) {
  return request({
    url: '/sample/list',
    method: 'get',
    params
  })
}

export function deleteSample(idsamples) {
  return request({
    url: '/sample/delete',
    method: 'get',
    params: { idsamples }
  })
}
