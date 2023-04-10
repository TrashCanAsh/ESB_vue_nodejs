//查询样品信息相关模块

const db=require('../db')
const Sample = require('../models/Sample')
const { DEBUG } = require('../utils/constant')

//获取样品种类数据列表（从view中获取）
async function getCategory() {
  const sql = 'select * from category order by categoryindex asc'
  const result = await db.querySql(sql)
  const categoryList = []
  result.forEach(item => {
    categoryList.push({
      label: item.category,
      value: item.categoryindex,
      num: item.num
    })
  })
  return categoryList
}
//获取样品信息列表
async function listSample(query) {
  DEBUG && console.log(query)
  const {
    name,
    category,    
    timeStart,
    timeEnd,
    NWlo,
    NWla,
    SElo,
    SEla,
    sort,
    page = 1,
    pageSize = 20
  } = query
  const offset = (page - 1) * pageSize
  let sampleSql = `select idsamples, name, category, samplingtime, samplinglocation, concat('(', longitude, ', ', latitude, ')') as samplinglna, wetweight, dryweight, state, locationofstorage, comment from samples`
  let where = 'where'
  name && (where = db.andLike(where, 'name', name));
  category && (where = db.and(where, 'category', category));
  (timeStart || timeEnd) && (where = db.andTime(where, 'samplingtime', timeStart, timeEnd));
  NWlo && SElo && (where = db.andLoc(where, 'longitude', NWlo, SElo));
  NWla && SEla && (where = db.andLoc(where, 'latitude', NWla, SEla));
  if (where !== 'where') {
    sampleSql = `${sampleSql} ${where}`
  }
  if (sort) {
    const symbol = sort[0]
    const column = sort.slice(1, sort.length)
    const order = symbol === '+' ? 'asc' : 'desc'
    sampleSql = `${sampleSql} order by \`${column}\` ${order}`
  }
  let countSql = `select count(*) as count from samples`
  if (where !== 'where') {
    countSql = `${countSql} ${where}`
  }
  const count = await db.querySql(countSql)
  sampleSql = `${sampleSql} limit ${pageSize} offset ${offset}`
  const list = await db.querySql(sampleSql)
  
  return { list, count: count[0].count, page, pageSize }
}

//删除某一样品信息
function deleteSample(idsamples) {
  return new Promise(async (resolve, reject) => {
    let sample = await getSample(idsamples)
    if (sample) {
      const sql = `delete from samples where idsamples='${idsamples}'`
      db.querySql(sql).then(() => {
        resolve()
      })
    } else {
      reject(new Error('样品信息不存在'))
    }
  })
}

//检查样品是否存在
function exists(sample) {
  const { name, category, samplingtime, longitude, latitude } = sample
  const sql = `select * from samples where name='${name}' and category='${category}' and samplingtime='${samplingtime}' and longitude='${longitude}' and latitude='${latitude}'`
  return db.queryOne(sql)
}
//新增样品信息
function insertSample(sample) {
  return new Promise(async (resolve, reject) => {
    try {
      if (sample instanceof Sample) {
        const result = await exists(sample)
        if (result) {
          reject(new Error('样品已存在'))
        } else {
          if (sample.idsamples < 0) {
            await queryLast('samples').then(result => {
              sample.idsamples = +(result ? result.idsamples : 0) + 1
            })
          }
          DEBUG && console.log(sample)
          await db.insert(sample.toDb(), 'samples')
          resolve()
        }
      } else {
        reject(new Error('添加的样品对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}
function multiInsertSample(sampleList) {
  return new Promise(async (resolve, reject) => {
    try {
      let dbList = []
      for(let i = 0; i < sampleList.length; i++) {
        const sample = sampleList[i]
        if (sample instanceof Sample) {
          const result = await exists(sample)
          if (result) {
            reject(new Error(`编号 ${sample.idsamples} 样品已存在`))
            break
          } else {
            if (sample.idsamples < 0) {
              await queryLast('samples').then(result => {
                sample.idsamples = +(result ? result.idsamples : 0) + 1
              })
            }
            //DEBUG && console.log(sample)
            dbList.push(sample.toDb())
          }
        } else {
          reject(new Error(`添加的${sample.idsamples}号样品对象不合法`))
          break
        }
      }
      DEBUG && console.log(dbList)
      await db.multiinsert(dbList, 'samples')
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}
//获取单一样品信息
function getSample(idsamples) {
  return new Promise(async (resolve, reject) => {
    const querySql = `select * from samples where idsamples='${idsamples}'`
    const sample = await db.queryOne(querySql)
    if (sample) {
      resolve(sample)
    } else {
      reject(new Error('样品信息不存在'))
    }
  })
}
//更新样品信息
function updateSample(sample) {
  return new Promise(async (resolve, reject) => {
    try {
      if (sample instanceof Sample) {
        const result = await getSample(sample.idsamples)
        if (result) {
          sample.categoryindex = result.categoryindex
          sample.stateindex = result.stateindex
          sample.state = result.state
          sample.locationofstorage = result.locationofstorage
          await db.update(sample.toDb(), 'samples', `where idsamples='${sample.idsamples}'`)
          resolve()
        }
      } else {
        reject(new Error('添加的样品对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}
//获取样品列表中最后一个样品的ID值
function queryLast(tablename) {
  const sql = `select * from ${tablename} order by id${tablename} desc limit 1`
  return db.queryOne(sql)
}


module.exports = {
  getCategory,
  listSample,
  getSample,
  deleteSample,
  multiInsertSample,
  insertSample,
  updateSample,
  queryLast
}