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
    curindex:0,
    clothes: [],
    pants: [],
    coat: [],
    skirt: [],
    isLogin: app.globalData.isLogin
  },

onLoad(){
  this._checkLogin()
},
  onShow() {
    showLoading('正在读取衣柜')
    let type = this.data.type
    wx.getSystemInfo({
      success: res => {
        this.setData({
          height: res.windowHeight,
          leftList: app.globalData.leftList,
          rightList: app.globalData.rightList,
          type
        })
      },
    })
if(this.data.isLogin||wx.getStorageSync('openid')){
  this.getClothes(type)
  this.getPants(type)
  this.getCoat(type)
  this.getSkirt(type)
}
    

    hideLoading()
  },
  //检查是否登录
  _checkLogin(){
   
    wx.checkSession({
      success: (res) => {
        this.setData({
          isLogin:true
        })
        app.globalData.isLogin = true
      },
      fail:(res)=>{
        this.setData({
          isLogin:false
        })
        app.globalData.isLogin = false
        wx.showToast({
          title: '请先登录',
          icon:'none',
          duration:2000
        })
      }
    })
  },
  addition() {
    if(this.data.isLogin){
      wx.navigateTo({
        url: '../addition/addition'
      })
    }
    
  },
doLogin(e){
  //先授权
  console.log(e);
  if(e.detail.errMsg=="getUserInfo:fail auth deny"){
    wx.showToast({
      title: "授权才能登录",
      icon:'none'
    })
  }else{
     //登录
    wx.login({
      success:()=>{
        wx.cloud.callFunction({
          name:'login',
          success:(res)=>{
            console.log(res);
            let openid = res.result.openid
            db.collection("user").where({_openid:openid}).get({
              success:(res)=>{
                console.log(res);
                if(res.data.length==0){
                  db.collection("user").add({
                    data:e.detail.userInfo
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
                  data:openid,
                  key:'openid'
                })
                this.setData({
                  isLogin:true,
                  userInfo: e.detail.userInfo
                })
                app.globalData.isLogin = true
                this.getClothes(type)
  this.getPants(type)
  this.getCoat(type)
  this.getSkirt(type)
              }
            })

          }
        })
      }
    })
  }
 
},
  async getClothes(type) {
    // 获取衣服信息
    await db.collection('clothes').where({
      temperatureType: type,
      openid:wx.getStorageSync('openid')
    }).get().then(res => {
      this.setData({
        clothes: res.data
      })
    })
  },
  async getPants(type) {
    // 获取裤子信息
    await db.collection('pants').where({
      temperatureType: type,
      openid:wx.getStorageSync('openid')
    }).get().then(res => {
      this.setData({
        pants: res.data
      })
    })
  },
  async getCoat(type) {
    // 获取外套信息
    await db.collection('coat').where({
      temperatureType: type,
      openid:wx.getStorageSync('openid')
    }).get().then(res => {
      this.setData({
        coat: res.data
      })
    })
  },
  async getSkirt(type) {
    // 获取裙子信息
    await db.collection('skirt').where({
      temperatureType: type,
      openid:wx.getStorageSync('openid')
    }).get().then(res => {
      this.setData({
        skirt: res.data
      })
    })
  },

  selectType(e) {
    console.log(e);
    let {type,curindex} = e.currentTarget.dataset
    this.setData({
      type,
      curindex
    })
    this.getClothes(type)
    this.getPants(type)
    this.getCoat(type)
    this.getSkirt(type)
   
  }


})