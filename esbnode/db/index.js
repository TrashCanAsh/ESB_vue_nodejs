const mysql = require('mysql')
const config = require('./config')
const { DEBUG } = require('../utils/constant')

//数据库连接设置，参数来自./config
function connect() {
  return mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true
  })
}
//sql语句查询
function querySql(sql) {
  const conn = connect()
  DEBUG && console.log(sql)
  return new Promise((resolve, reject) => {
    try {
      DEBUG && conn.query(sql, (err, results) => {
        if (err) {
          DEBUG && console.log('查询失败，原因:' + JSON.stringify(err))
          reject(err)
        } else {
          DEBUG && console.log('查询成功', JSON.stringify(results))
          resolve(results)
        }
      })
    } catch (e) {
      reject(e)
    } finally {
      conn.end()
    }
  })
}
//单独sql语句查询（只返回一条数据）
function queryOne(sql){
  return new Promise((resolve, reject) => {
    querySql(sql)
      .then(results => {
        if (results && results.length > 0) {
          resolve(results[0])
        } else {
          resolve(null)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}
//
function queryLast(tablename) {
  return new Promise((resolve, reject) => {
    querySql(`select * from '${tablename}' order by id'${tablename}' desc limit 1`)
      .then(results => {
        if (results && results.length > 0) {
          resolve(results[0])
        } else {
          resolve(null)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

module.exports = {
  querySql,
  queryOne,
  queryLast
}