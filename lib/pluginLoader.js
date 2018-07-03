
export function pluginLoaderMixin(Cordova){

    Cordova.prototype.loadPlugins = function(pluginMap){
      let channel = this.$channel 
      let pluginNames = Object.keys(pluginMap) //获取所有注册的plugin
      let pluginDeps = {}
       // 管理plugin的依赖
        for (const pluginName in pluginNames){
           Object.defineProperty(this, pluginName,{
              get :function(){
                
              },
              set:function(newValue){

              },
              enumerable : true,
              configurable : true
           })
        }

        function createPlugin(pluginName){
            const pluginClass = pluginMap[pluginName]
            let properties = Object.getOwnPropertyNames(pluginClass.prototype) 
            let onMethods = Array.prototype.filter.call(properties, (str) =>{ return /^on\w+/.test(str)}) 
            const plugin = new pluginClass(this)
            //生命周期事件的绑定
            channel.onCordovaReady.subscribe(plugin.cordovaReady,plugin)
            channel.onDeviceReady.subscribe(plugin.deviceReady,plugin)
            //对所有on事件的处理
            return plugin
        }

        // 根据pluginName
        for (const key in pluginMap) {
            if (pluginMap.hasOwnProperty(key)) {
                const pluginClass = pluginMap[key];
               // 遍历有on的属性注册到channel当中
               let properties = Object.getOwnPropertyNames(pluginClass.prototype)
               let onMethods = Array.prototype.filter.call(properties, (str) =>{ return /^on\w+/.test(str)})
               
                // 遍历所有onMethods为增加属性

                // 考虑对该对象的访问做依赖管理，增加代理对象

                // for (const methodName in onMethods){
                //     if(typeof pluginClass.prototype.methodName == "function"){
                //        let eventName = str.substring("on".length).toLowerCase(); //将事件全部转换成小写
                //     }
                // }
            }
        }
    }
}