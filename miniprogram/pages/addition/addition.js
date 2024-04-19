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
    occasionIndex:'0',
    temperatureType: 1,
    categoryType: 'clothes',
    color: '',
    clothesTemperature: [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    add: true,
    curId:"",
    curCategoryType:'',
    occasionList:app.globalData.occasionList,
    occasionType:1,
    occasionIndex:0,
    curType:'temperature',
  },

  onLoad(option) {
    this.setData({
      temperature: app.globalData.leftList,
      category: app.globalData.rightList
    })
    console.log('option',option);
    if(option?.curType){
      this.setData({
        curType:option.curType
      })
    }
    if (option?.clothes) {
      console.log('option', JSON.parse(option.clothes));
      wx.setNavigationBarTitle({
        title: '编辑衣物'
     })
     
      let {
        imageUrl,
        color,
        temperatureType,
        categoryType,_id,
        occasionType
      } = JSON.parse(option.clothes)
      let categoryIndex = app.globalData.rightList.findIndex(t => t.type == categoryType)
      let occasionIndex = app.globalData.occasionList.findIndex(t => t.type == occasionType)
      this.setData({
        add: false,
        imageUrl,
        color,
        temperatureIndex: temperatureType - 1,
        categoryIndex,
        temperatureType,
        categoryType,
        curCategoryType:categoryType,
        curId:_id,
        occasionIndex,
        occasionType
      })
    }
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
  selectClothesTemperature(e) {
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
  selectOccasion(e) {
    this.setData({
      occasionIndex: e.detail.value,
      occasionType: app.globalData.occasionList[e.detail.value].type
    })
  },
  
  getColor(event) {
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
      occasionType: this.data.occasionType,
      color: this.data.color,
      openid: wx.getStorageSync('openid')
      
    }
    console.log('submit',data);
    if (!this.data.imageUrl) {
      showModal('请先添加照片')
      return
    }
    if (!this.data.color) {
      showModal('请输入衣物颜色')
      return
    }
    if(this.data.add){
      this.addData(data)
    }else{
      data.curId = this.data.curId
      this.updateClothes(data)
    }
   
   
  },

  async addData(data,flag=true) {
   
    showLoading(flag?'正在添加':"正在修改")
    // 发起添加数据到云数据库请求
    let add = await addData(data)

    let {
      code
    } = add

    if (code === 0) {
      wx.showToast({
        title: flag?'添加成功':"修改成功",
        icon: 'success',
        duration: 2000
      })
      setTimeout(() => {
        wx.navigateBack({
          url: `../wardrobe/wardrobe?type=${this.data.curType}`,
        })
      }, 1000)
      hideLoading()

    } else {

      showModal('网络异常,请稍后再试')
      hideLoading()

    }
  },
  //编辑 
  updateClothes(data){
    console.log('data.categoryType',data);
    db.collection(data.categoryType).where({
      _id: data.curId
    }).get({
      success:(res)=>{
        if(res.data.length == 0){
          this.formatDate(data)
        }else{
          db.collection(data.categoryType).doc(data.curId).update({
            // data 传入需要局部更新的数据
            data,
            success: (res)=> {
              console.log(res);
              if(res.errMsg=="document.update:ok"){
                wx.showToast({
                  title: '修改成功',
                  icon: 'success',
                  duration: 2000
                })
                setTimeout(() => {
                  console.log('setTimeout',this.data.curType);
                  wx.navigateBack({
                    url: `../wardrobe/wardrobe?type=${this.data.curType}`,
                  })
                }, 1000)
              }
            }
          })
        }
      }
    })
   
  },
  //所选集合没有该数据 则先将原集合数据删除再添加
formatDate(data){
  db.collection(this.data.curCategoryType).doc(data.curId).remove({
    success: (res) =>{
      console.log(res)
      if (res.errMsg =="document.remove:ok") {
       this.addData(data,false)
      }
    }
  })
}
})

