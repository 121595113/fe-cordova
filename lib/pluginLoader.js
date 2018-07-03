
export function pluginLoaderMixin(Cordova){

    Cordova.prototype.loadPlugins = function(pluginMap){
      let channel = this.$channel 
      let pluginNames = Object.keys(pluginMap) //获取所有注册的plugin
      let pluginDeps = {}
      function createPlugin(pluginName){
            const pluginClass = pluginMap[pluginName]
            let properties = Object.getOwnPropertyNames(pluginClass.prototype) 
            let onMethods = Array.prototype.filter.call(properties, (str) =>{ return /^on\w+/.test(str)}) 
            const plugin = new pluginClass(this)
            //生命周期事件的绑定
            channel.onCordovaReady.subscribe(plugin.cordovaReady,plugin)
            channel.onDeviceReady.subscribe(plugin.deviceReady,plugin)
            //对所有on事件的处理，暂时不是应用内部
            for (const methodName in onMethods) {
                if (typeof plugin[methodName] === "function"){
                    const eventName = methodName.substring(2).toLowerCase(); //获取事件名称
                    //检测有没有事件在channel中 没有事件挂载事件
                    if(!channel[eventName]){
                        channel.createSticky(eventName)
                        channel.waitForInitialization(event)
                    }
                    channel[eventName].subscribe(plugin[methodName],plugin)
                }
            }
            plugin.created()
            return plugin
        }
        // 管理plugin的依赖
        for (const pluginName in pluginNames){
            Object.defineProperty(this, pluginName,{
               get :function(){
                 if (!pluginDeps[pluginName]){
                     
                 }
               },
               set:function(newValue){
 
               },
               enumerable : true,
               configurable : true
            })
         } 
         //初始化插件
    }
}