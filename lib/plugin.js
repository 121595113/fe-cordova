class Plugin {
  constructor(cordova) {
    this.cordova = cordova;

  }
  //内置函数 注册事件，响应回调
  on(event, cb) {
    if ( typeof cb  !== 'function' ){
        throw new Error('event callback is supposed to be function Type')
    }
    let channel = this.cordova.$channel
    channel[event]||channel.createSticky(event)
    channel[event].subscribe(cb,this)
  }
  //插件内注册事件的通知
  notify(event, params) {
    this.cordova.$channel[event].fire(...params)
  }
  //生命周期函数
  created() {

  }
  cordovaReady() {

  }
  deviceReady() {

  }

  destroy() {

  }
}
Plugin.hash = "cordova_plugin"
export default Plugin
