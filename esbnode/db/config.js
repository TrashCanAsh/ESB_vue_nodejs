const { env } = require('../utils/env')

const host = env === 'dev' ? 'localhost' : 'localhost'
const user = env === 'dev' ? 'root' : 'root'
const password = env === 'dev' ? 'root' : ''
const database = env === 'dev' ? 'test01' : 'hias_esb'
//数据库基础参数
module.exports = {
  host,
  user,
  password,
  database
}