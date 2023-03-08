import request from '../utils/request'

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

export function deleteSample(fileName) {
  return request({
    url: '/sample/delete',
    method: 'get',
    params: { fileName }
  })
}
