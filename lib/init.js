
export function initMixin(Cordova){
   Cordova.prototype._init = function(options){
     this.loadPlugins(options.pluginMap)
   }
}
