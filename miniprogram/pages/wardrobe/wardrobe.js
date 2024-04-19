const db = wx.cloud.database()
const app = getApp()

import {
  showLoading,
  hideLoading,
  showModal
} from '../../utils/util.js'

Page({


  data: {
    type: 1,
    clothes: [],
    pants: [],
    coat: [],
    skirt: [],
    showOpt: false,
    isLogin: app.globalData.isLogin,
    curType:'temperature',
   selectTypeIndex:1
  },

  onLoad(option) {
    console.log('ol',option);
    this._checkLogin()
    if(option?.type){
      this.setData({
        curType:option.type
      })
    }
  },
  onShow() {
    console.log('this.data.curType',this.data.curType);
    showLoading('正在读取衣柜')
    let type = this.data.type
    wx.getSystemInfo({
      success: res => {
        this.setData({
          height: res.windowHeight,
          leftList: this.data.curType=='temperature'?app.globalData.leftList:app.globalData.occasionList,
          rightList: app.globalData.rightList,
          type:this.data.curType=="temperature"?type:this.data.selectTypeIndex
        })
      },
    })
    if (this.data.isLogin || wx.getStorageSync('openid')) {
      this.getClothes(type)
      this.getPants(type)
      this.getCoat(type)
      this.getSkirt(type)
    }


    hideLoading()
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
          duration: 2000
        })
      }
    })
  },
  addition() {
    if (this.data.isLogin) {
      wx.navigateTo({
        url: `../addition/addition?curType=${this.data.curType}`
      })
    }

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
                  this.getClothes(1)
                  this.getPants(1)
                  this.getCoat(1)
                  this.getSkirt(1)
                }
              })

            }
          })
        }
      })
    }

  },
  longpress() {
    console.log('longpress');
    this.setData(({
      showOpt: true
    }))
  },
  cancle() {
    this.setData(({
      showOpt: false
    }))
  },
  //编辑
  toUpdate(e) {

    wx.navigateTo({
      url: `../addition/addition?clothes=${JSON.stringify(e.currentTarget.dataset.clothes)}?curType=${this.data.curType}`,

    })
  },
  toDel(e) {
    console.log('toDel', e);
    
    let {
      _id,
      categoryType,
      temperatureType,
      occasionType
    } = e.currentTarget.dataset.clothes
    wx.showModal({
      title: '提示',
      content: '确认删除吗',
      success: (res)=> {
        if (res.confirm) {
          this.setData({
            showOpt:false
          })
          db.collection(categoryType).doc(_id).remove({
            success: (res) =>{
              console.log(res)
              if (res.errMsg =="document.remove:ok") {
                
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                })
                let type = this.data.curType=="temperature"?temperatureType:occasionType
                setTimeout(()=>{
                  this.getClothes(type)
                this.getPants(type)
                this.getCoat(type)
                this.getSkirt(type)
                },1000)
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },
  async getClothes(type) {
    let req = this.data.curType=='temperature'?{temperatureType: type}:{occasionType:type}
    // 获取衣服信息
    await db.collection('clothes').where({
      ...req,
      openid: wx.getStorageSync('openid')
    }).get().then(res => {
      this.setData({
        clothes: res.data
      })
    })
  },
  async getPants(type) {
    // 获取裤子信息
    let req = this.data.curType=='temperature'?{temperatureType: type}:{occasionType:type}
    await db.collection('pants').where({
      ...req,
      openid: wx.getStorageSync('openid')
    }).get().then(res => {
      this.setData({
        pants: res.data
      })
    })
  },
  async getCoat(type) {
    // 获取外套信息
    let req = this.data.curType=='temperature'?{temperatureType: type}:{occasionType:type}
    await db.collection('coat').where({
      ...req,
      openid: wx.getStorageSync('openid')
    }).get().then(res => {
      this.setData({
        coat: res.data
      })
    })
  },
  async getSkirt(type) {
    // 获取裙子信息
    let req = this.data.curType=='temperature'?{temperatureType: type}:{occasionType:type}
    await db.collection('skirt').where({
      ...req,
      openid: wx.getStorageSync('openid')
    }).get().then(res => {
      this.setData({
        skirt: res.data
      })
    })
  },

  selectType(e) {
    console.log(e);
    let {
      type,
    } = e.currentTarget.dataset
    this.setData({
      type,
    })
    this.getClothes(type)
    this.getPants(type)
    this.getCoat(type)
    this.getSkirt(type)

  }


})