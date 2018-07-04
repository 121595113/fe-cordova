import exec from './exec';

export function initMixin(Cordova) {
  Cordova.prototype._init = function (options) {
    this.initEvent();
    this.loadPlugins(options.pluginMap);
  }
  Cordova.prototype.exec = exec;
}
