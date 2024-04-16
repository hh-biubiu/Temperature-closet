
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 接收从小程序端过来的数据
    let {
      data
    } = event
    // 将数据添加到云数据库
    const addData = await db.collection(data.categoryType).add({
      data: data
    })
    return {
      code: addData.errMsg === 'collection.add:ok' ? 0 : 1
    }
    
  } catch (err) {
    return err
  }

}