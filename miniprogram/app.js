App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    this.globalData = {
      isLogin: false,
      leftList: [{
          title: '炎热',
          temperature: '28°C以上',
          type: 1
        },
        {
          title: '温和',
          temperature: '20-28°C',
          type: 2
        },
        {
          title: '冷',
          temperature: '5-20°C',
          type: 3
        },
        {
          title: '寒冷',
          temperature: '5°C以下',
          type: 4
        }
      ],
      rightList: [{
          title: '上衣',
          type: 'clothes'
        },
        {
          title: '裤子',
          type: 'pants'
        },
        {
          title: '外套',
          type: 'coat'
        },
        {
          title: '连衣裙',
          type: 'skirt'
        },
      ],
      occasionList: [{
        title: '正式',
        type: 1
      }, {
        title: '休闲',
        type: 2

      }, {
        title: '运动',
        type: 3
      }]
    }
  }
})