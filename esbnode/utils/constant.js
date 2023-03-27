const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ? '/upload/ESBsample' : '/root/upload/ESBsample';
//全局参数列表
module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  CODE_TOKEN_EXPIRED: -2,
  DEBUG: true,//是否为DEBUG状态
  PWD_SALT: 'HIAS_ESB_test',//加盐
  PRIVATE_KEY: 'UniversityofChineseAcademyofSciences_HangzhouInstituteforAdvancedStudy_CollegeofEnvironment',//生成token使用的私人密钥
  JWT_EXPIRED: 60 * 60 * 4,//token失效时间（单位：秒）
  UPLOAD_PATH
}