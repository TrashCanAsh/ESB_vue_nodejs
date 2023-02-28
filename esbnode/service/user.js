//用户相关业务逻辑处理

const { querySql, queryOne }=require('../db')
//检验用户是否能够登录
function login(username, password) {
  const sql = `select * from user where username='${username}' and password='${password}'`
  return querySql(sql)
}
//查询单一用户的信息
function findUser(username) {
  const sql = `select iduser, name, username, role, institute, phonenumber from user where username='${username}'`
  return queryOne(sql)
}
  
module.exports = {
  login,
  findUser
}