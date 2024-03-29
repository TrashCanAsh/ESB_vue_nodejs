const mysql = require('mysql')
const config = require('./config')
const { DEBUG } = require('../utils/constant')
const { isObject } = require('../utils')

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
      conn.query(sql, (err, results) => {
        if (err) {
          DEBUG && console.log('操作失败，原因:' + JSON.stringify(err))
          reject(err)
        } else {
          DEBUG && console.log('操作成功', JSON.stringify(results))
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

function insert(model, tableName) {
  return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error('插入数据库失败，插入数据非对象'))
    } else {
      DEBUG && console.log(model)
      const keys = []
      const values = []
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          keys.push(`\`${key}\``)
          values.push(`'${model[key]}'`)
        }
      })
      if (keys.length > 0 && values.length > 0) {
        let sql = `INSERT INTO \`${tableName}\` (`
        const keysString = keys.join(',')
        const valuesString = values.join(',')
        sql = `${sql}${keysString}) VALUES (${valuesString})`
        DEBUG && console.log(sql)
        const conn = connect()
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      } else {
        reject(new Error('插入数据库失败，对象中没有任何属性'))
      }
    }
  })
}

function multiinsert(modelList, tableName) {
  return new Promise((resolve, reject) => {
    let msql = ''
    for(let i = 0; i < modelList.length; i++) {
      const model = modelList[i]
      if (!isObject(model)) {
        reject(new Error('插入数据库失败，插入数据非对象'))
      } else {
        DEBUG && console.log(model)
        const keys = []
        const values = []
        Object.keys(model).forEach(key => {
          if (model.hasOwnProperty(key)) {
            keys.push(`\`${key}\``)
            values.push(`'${model[key]}'`)
          }
        })
        if (keys.length > 0 && values.length > 0) {
          let sql = `INSERT INTO \`${tableName}\` (`
          const keysString = keys.join(',')
          const valuesString = values.join(',')
          sql = `${sql}${keysString}) VALUES (${valuesString});`
          msql = `${msql}${sql}`
        } else {
          reject(new Error('插入数据库失败，对象中没有任何属性'))
        }
      }
    }
    DEBUG && console.log(msql)
    if (msql && msql.length > 0) {
      const conn = connect()
      try {
        conn.query(msql, (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      } catch (e) {
        reject(e)
      } finally {
        conn.end()
      }
    }
  })
}

function update(model, tableName, where) {
  return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error('插入数据库失败，插入数据非对象'))
    } else {
      const entry = []
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          entry.push(`\`${key}\`='${model[key]}'`)
        }
      })
      if (entry.length > 0) {
        let sql = `UPDATE \`${tableName}\` SET`
        sql = `${sql} ${entry.join(',')} ${where}`
        DEBUG && console.log(sql)
        const conn = connect()
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      }
    }
  })
}

function and(where, k, v) {
  if (where === 'where') {
    return `${where} \`${k}\`='${v}'`;
  } else {
    return `${where} and \`${k}\`='${v}'`;
  }
}

function andLike(where, k, v) {
  if (where === 'where') {
    return `${where} \`${k}\` like '%${v}%'`;
  } else {
    return `${where} and \`${k}\` like '%${v}%'`;
  }
}

function andLoc(where, k, lowv, highv) {
  if (where === 'where') {
    return `${where} \`${k}\` >= '${lowv}' and \`${k}\` <= '${highv}'`;
  } else {
    return `${where} and \`${k}\` >= '${lowv}' and \`${k}\` <= '${highv}'`;
  }
}

function andTime(where, k, start, end) {
  if(!start) {
    start = '1970/01/01'
  }
  if(!end) {
    end = '2099/01/01'
  }
  
  if (where === 'where') {
    return `${where} \`${k}\` >= '${start}' and \`${k}\` <= '${end}'`;
  } else {
    return `${where} and \`${k}\` >= '${start}' and \`${k}\` <= '${end}'`;
  }
}


module.exports = {
  querySql,
  queryOne,
  insert,
  multiinsert,
  update,
  and,
  andLike,
  andLoc,
  andTime
}