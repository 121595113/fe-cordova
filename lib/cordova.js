import Plugin from './plugin'
import { initMixin } from './init'
import { pluginLoaderMixin } from './pluginloader'
import { eventMixin } from './event'
let pluginMap = {};
let cordova;
class Cordova {
     constructor(options){
       this.options = options
       if(cordova){
           throw new Error("cordova instance already defined");
       }
       cordova = this
       this._init(options)
     }
    initMixin(Cordova)
    eventMixin(Cordova)
    pluginLoaderMixin(Cordova)
}


Cordova.registerPlugin = function(name, klass){
     if (klass.hash !== Plugin.hash){
        throw new Error("Cordova Plugin should extend from Plugin Class")
     }
    pluginMap[name]||(pluginMap[name] = klass)
}


export default Cordova