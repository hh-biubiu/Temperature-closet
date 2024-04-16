const getWeather = async(lat, lon) => {
  // 调用云函数发起第三方API请求
  const {
    result
  } = await wx.cloud.callFunction({
    name: 'Weather',
    data: {
      lat,
      lon
    }
  })
  return result
}

const addData = async(data) => {
  // 调用云函数添加数据到云数据库
  const {
    result
  } = await wx.cloud.callFunction({
    name: 'Add',
    data: {
      data
    }
  })
  return result
}

module.exports = {
  getWeather,
  addData
}