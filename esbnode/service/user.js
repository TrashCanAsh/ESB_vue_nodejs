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
//查询用户是否存在
function isUserExist(username) {
  const sql = `select * from user where username='${username}'`
  return queryOne(sql)
}
//注册新用户信息
function signup(username, password, num) {
  const sql = `insert into user (iduser, name, username, password, role) values (${num}, '${username}', '${username}', '${password}', 'user')`
  return querySql(sql)
}
//查询用户表中最后一个用户的ID值
function queryLast(tablename) {
  const sql = `select * from ${tablename} order by id${tablename} desc limit 1`
  return queryOne(sql)
}
  
module.exports = {
  login,
  findUser,
  signup,
  isUserExist,
  queryLast
}