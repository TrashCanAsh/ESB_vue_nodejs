//查询样品信息相关模块

const { querySql, queryOne }=require('../db')
//
function sample(){
  const sql = `select * from user where username='1' and password='1'`
  return querySql(sql)
}
function sample(a){
    const sql = `select * from user where username='1' and password='1'`
    return querySql(sql)
}



module.exports = {
  sample
}