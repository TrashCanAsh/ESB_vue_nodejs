//查询样品信息相关模块

const db=require('../db')
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
  let sampleSql = `select idsamples, name, category, samplingtime, concat('(', longitude, ', ', latitude, ')') as samplinglocation, state, locationofstorage, comment from samples`
  let where = 'where'
  name && (where = db.andLike(where, 'name,', name))
  category && (where = db.and(where, 'category', category))
  (timeStart || timeEnd) && (where = db.andTime(where, 'samplingtime', timeStart, timeEnd))
  NWlo && SElo && (where = db.andLoc(where, 'longitude', NWlo, SElo))
  NWla && SEla && (where = db.andLoc(where, 'latitude', NWla, SEla))
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
function deleteSample(fileName) {
  return new Promise(async (resolve, reject) => {
    let book = await getBook(fileName)
    if (book) {
      const bookObj = new Book(null, book)
      const sql = `delete from book where fileName='${fileName}'`
      db.querySql(sql).then(() => {
        bookObj.reset()
        resolve()
      })
    } else {
      reject(new Error('样品信息不存在'))
    }
  })
}


module.exports = {
  getCategory,
  listSample,
  deleteSample
}