import Plugin from './plugin'
import { initMixin } from './init'
import { eventMixin } from './event'
import { pluginLoaderMixin } from './pluginLoader'

let pluginMap = {};
let cordova;

class Cordova {
  constructor(options = {}) {
    if (cordova) {
      throw new Error("cordova instance already defined");
    }
    cordova = this
    options.pluginMap = pluginMap
    this._init(options)
  }
}

initMixin(Cordova)
eventMixin(Cordova)
pluginLoaderMixin(Cordova)

Cordova.registerPlugin = function (name, klass) {
  if (klass.hash !== Plugin.hash) {
    throw new Error("Cordova Plugin should extend from Plugin Class")
  }
  pluginMap[name] || (pluginMap[name] = klass)
}

export default Cordova
