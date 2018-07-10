export function pluginLoaderMixin(Cordova) {

  Cordova.prototype.loadPlugins = function (pluginMap) {
    let channel = this.$channel;
    let pluginNames = Object.keys(pluginMap) //获取所有注册的plugin
    let pluginDeps = {}
    let pluginRef = [];

    function createPlugin(pluginName) {
      const pluginClass = pluginMap[pluginName]
      let properties = Object.getOwnPropertyNames(pluginClass.prototype)
      let onMethods = Array.prototype.filter.call(properties, str => /^on\w+/.test(str))
      const plugin = new pluginClass(this)
      //生命周期事件的绑定
      channel.onCordovaReady.subscribe(plugin.cordovaReady, plugin)
      channel.onDeviceReady.subscribe(plugin.deviceReady, plugin)
      //对所有on事件的处理，暂时不是应用内部
      for (const methodName of onMethods) {
        if (typeof plugin[methodName] === 'function') {
          const eventName = methodName.charAt(2).toLowerCase() + methodName.substring(3); //获取事件名称
          //检测有没有事件在channel中 没有事件挂载事件
          if (!channel[eventName]) {
            channel.createSticky(eventName)
            channel.waitForInitialization(event)
          }
          channel[eventName].subscribe(plugin[methodName], plugin)
        }
      }
      plugin.created()
      return plugin
    }
    // 管理plugin的依赖

    for (const pluginName of pluginNames) {
      Object.defineProperty(this, pluginName, {
        get() {
          if (!pluginDeps[pluginName]) {
            if (pluginRef.indexOf(pluginName) !== -1) {
              throw new Error(`Plugin: ${pluginName} has duplicated reference`);
            }
            pluginRef.push(pluginName)
            pluginDeps[pluginName] = createPlugin.call(this, pluginName)
            pluginRef.pop()
          }
          return pluginDeps[pluginName]
        },
        enumerable: true,
        configurable: true
      })
    }
    //初始化插件
    for (const pluginName of pluginNames) {
      if (!pluginDeps[pluginName]) {
        pluginRef.push(pluginName)
        pluginDeps[pluginName] = createPlugin.call(this, pluginName)
        pluginRef.pop()
      }
    }
    setTimeout(() => {
      channel.onPluginsReady.fire()
    }, 0);
  }
}
