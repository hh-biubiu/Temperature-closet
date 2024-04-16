const db = wx.cloud.database()
const app = getApp()
import {
  getWeather
} from '../../utils/api.js'

import {
  showLoading,
  hideLoading,
  showModal,
  dressing
} from '../../utils/util.js'


Page({

  data: {
    loading: false,
    isLogin: app.globalData.isLogin,
    lat:"",
    lon:"",
    suit: {
      "clothes": [],
      "pants": [],
      "coat": [],
      "skirt": []
    }


  },
  onLoad() {
    this._checkLogin()
  },
  onShow(options) {
    this.setData({
      isLogin: app.globalData.isLogin
    })

    showLoading('正在获取')

    wx.getSystemInfo({
      success: res => {
        this.setData({
          heigth: res.screenHeight
        })
      },
    })

    wx.getLocation({
      success: res => {
        let {
          latitude,
          longitude
        } = res
        this.setData({
          lat:latitude,
          lon:longitude
        })
        this.getWeather(latitude, longitude)

      },
      fail: err => {
        console.log(err)
      }
    })
  },

  //检查是否登录
  _checkLogin() {

    wx.checkSession({
      success: (res) => {
        this.setData({
          isLogin: true
        })
        app.globalData.isLogin = true
      },
      fail: (res) => {
        this.setData({
          isLogin: false
        })
        app.globalData.isLogin = false
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 4000
        })
      }
    })
  },
  doLogin(e) {
    //先授权
    console.log(e);
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: "授权才能登录",
        icon: 'none'
      })
    } else {
      //登录
      wx.login({
        success: () => {
          wx.cloud.callFunction({
            name: 'login',
            success: (res) => {
              console.log(res);
              let openid = res.result.openid
              db.collection("user").where({
                _openid: openid
              }).get({
                success: (res) => {
                  console.log(res);
                  if (res.data.length == 0) {
                    db.collection("user").add({
                      data: e.detail.userInfo
                    })
                  }
                  wx.showToast({
                    title: '登录成功',
                  })
                  wx.setStorage({
                    data: e.detail.userInfo,
                    key: 'userInfo',
                  })
                  wx.setStorage({
                    data: openid,
                    key: 'openid'
                  })
                  this.setData({
                    isLogin: true,
                    userInfo: e.detail.userInfo
                  })
                  app.globalData.isLogin = true
                  this.getWeather(this.data.lat,this.data.lon)

                }
              })

            }
          })
        }
      })
    }

  },
  async getWeather(lat, lon) {
    // 发起云函数请求
    let data = await getWeather(lat, lon)

    let {
      err,
      weatherData,
      lifeData,
      weatherRangeData
    } = data


    if (err) {
      showModal(err.message)
      hideLoading()
      return
    }

    let temperature = parseFloat(weatherData.results[0].now.temperature)
    let dress = dressing(temperature)
    let suit = this.data.suit
    lifeData.results[0].suggestion.dressing.details = dress
    console.log('opneid',this.data.isLogin , wx.getStorageSync('openid'))
    if (this.data.isLogin || wx.getStorageSync('openid')) {
      this.getSuit(suit, dress.type)
    }

    this.setData({
      weatherData,
      lifeData,
      weatherRangeData
    })

    hideLoading()

  },

  async getSuit(category, type) {
    // let radio = 26 - temperature
    // console.log('radio', radio);
    let data = {}

    for (let index in category) {
      await db.collection(index).aggregate()
        .match({
          temperatureType: type,
          openid: wx.getStorageSync('openid')
        }).sample({
          size: 3
        })
        .end().then(res => {
          console.log(index, res);
          data[index] = res.list
          // data.push(...res.data)
        }).catch(err => {
          console.log(err)
        })
      console.log('data', data);
      this.setData({
        suit: data,
        loading: false
      })
    }


    hideLoading()

  },

})