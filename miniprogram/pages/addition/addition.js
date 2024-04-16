const app = getApp()
const db = wx.cloud.database()
import {
  showLoading,
  hideLoading,
  showModal
} from '../../utils/util.js'
import {
  addData
} from '../../utils/api.js'

Page({


  data: {
    imageUrl: '',
    temperatureIndex: '0',
    clothestemperatureIndex: '0',
    categoryIndex: '0',
    temperatureType: 1,
    categoryType: 'clothes',
    color:'',
    clothesTemperature:[0.5,1,2,3,4,5,6,7,8,9]
  },

  onLoad() {
    this.setData({
      temperature: app.globalData.leftList,
      category: app.globalData.rightList
    })
  },

  addImage(e) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.uploadImg(res.tempFilePaths[0])
      }
    })
  },

  uploadImg(path) {
    showLoading('正在上传')
    let category = this.data.categoryType
    let suiji = Math.floor(Math.random() * 100000)
    let year = new Date().getFullYear()
    let month = new Date().getMonth() + 1
    let day = new Date().getDate()
    let name = category + '/' + year + month + +day + +suiji + '.jpg'
    // 发起添加到云存储
    wx.cloud.uploadFile({
      cloudPath: name,
      filePath: path,
      success: res => {
        this.setData({
          imageUrl: res.fileID
        })
        hideLoading()
      },
      fail: err => {
        hideLoading()
      }
    })
  },


  selectTemperature(e) {

    this.setData({
      temperatureIndex: e.detail.value,
      temperatureType: app.globalData.leftList[e.detail.value].type
    })
  },
  selectClothesTemperature(e){
    console.log(e);
    this.setData({
      clothestemperatureIndex: e.detail.value,
    })
  },
  selectCategory(e) {
    this.setData({
      categoryIndex: e.detail.value,
      categoryType: app.globalData.rightList[e.detail.value].type
    })
  },
  getColor(event){
    console.log('event',event);
    this.setData({
      color: event.detail.value
    })
  },
  submit() {
    let data = {
      imageUrl: this.data.imageUrl,
      temperatureType: this.data.temperatureType,
      // temperature:this.data.clothesTemperature[this.data.clothestemperatureIndex],
      categoryType: this.data.categoryType,
      color:this.data.color,
      openid:wx.getStorageSync('openid')
    }
    this.addData(data)
  },

  async addData(data) {
    if (!this.data.imageUrl) {
      showModal('请先添加照片')
      return
    }
    if (!this.data.color) {
      showModal('请输入衣物颜色')
      return
    }
    showLoading('正在添加')
    // 发起添加数据到云数据库请求
    let add = await addData(data)

    let {
      code
    } = add

    if (code === 0) {
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
      setTimeout(() => {
        wx.switchTab({
          url: '../wardrobe/wardrobe',
        })
      }, 1000)
      hideLoading()

    } else {

      showModal('网络异常,请稍后再试')
      hideLoading()

    }
  }
})