const cloud = require('wx-server-sdk')
const axios = require('axios')
// 配置云函数环境变量
const KEY = 'S9HEf-_JKbC_1Zc2W'

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 同级目录引入文件
const {
  WEATHER_URL,
  LIFE_URL,
  LANGUAGE,
  UNIT,
  WEATHER_RANGE_URL
} = require('./config.js')


exports.main = async (event, context) => {

  try {
    // 接收从小程序端过来的数据
    let {
      lat,
      lon
    } = event
    //  拼接请求url
    const weatherUrl = `${WEATHER_URL}key=${KEY}&location=${lat}:${lon}&language=${LANGUAGE}&unit=${UNIT}`
    const weatherRangeUrl = `${WEATHER_RANGE_URL}key=${KEY}&location=${lat}:${lon}&language=${LANGUAGE}&unit=${UNIT}&start=0&days=1`

    const lifeUrl = `${LIFE_URL}key=${KEY}&location=${lat}:${lon}&language=${LANGUAGE}`
    // 发起第三方API请求
    const weatherData = await axios.get(weatherUrl)
    const weatherRangeData = await axios.get(weatherRangeUrl)
    const lifeData = await axios.get(lifeUrl)
    // 返回请求数据
    return {
      weatherData: weatherData.data,
      lifeData: lifeData.data,
      weatherRangeData:weatherRangeData.data
    }

  } catch (err) {

    return {
      err
    }

  }

}