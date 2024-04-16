function showLoading(message) {
  wx.showLoading({
    title: message,
    mask: true
  })
}

function hideLoading() {
  wx.hideLoading()
}

function showModal(message) {
  wx.showModal({
    content: message,
    showCancel: false
  })
}

function showToast(message) {
  wx.showToast({
    title: message,
    icon: 'none',
    mask: true,
    duration: 20000
  })
}

function hideToast() {
  wx.hideToast();
}


function dressing(weather) {
  switch (true) {
    case weather < 45 && weather >= 28:
      {
        return {
          "type": 1,
          "message": '天气炎热，适宜着短衫、短裙、短裤、薄型T恤衫、敞领短袖棉衫等夏季服装。',
        }

      }
    case weather < 28 && weather >= 20:
      {
        return {
          "type": 2,
          "message": '天气温和，适宜着短衫、短裙、短套装、T恤等夏季服装。年老体弱者：单层薄衫裤、薄型棉衫。'
        }

      }
    case weather < 20 && weather >= 5:
      {
        return {
          "type": 3,
          "message": '天气冷，适宜着一到两件羊毛衫、大衣、毛套装、皮夹克等春秋着装；年老体弱者宜着大衣、夹衣或风衣加羊毛衫等厚型春秋着装。'
        }
      }
    case weather < 5 && weather >= -15:
      {
        return {
          "type": 4,
          "message": '天气寒冷，冬季着装：棉衣、羽绒衣、冬大衣、皮夹克、毛衣再外罩大衣等；年老体弱者尤其要注意保暖防冻。'
        }

      }
  }
}



module.exports = {
  showLoading: showLoading,
  hideLoading: hideLoading,
  showModal: showModal,
  showToast: showToast,
  hideToast: hideToast,
  dressing: dressing
}