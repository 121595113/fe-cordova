class Plugin {
  constructor(cordova) {
    this.cordova = cordova;
  }
  //内置函数 注册事件，响应回调
  on(event, cb) {

  }
  //插件内注册事件的通知
  notify(event, params) {

  }
  //生命周期函数
  created() {

  }
  deviceReady() {

  }
  cordovaReady() {

  }
  destroy() {

  }
}
Plugin.hash = "cordova_plugin"
export default Plugin
