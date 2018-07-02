cordova.define('cordova-plugin-track.track', function (require, exports, module) {
    var exec = require('cordova/exec');
    exports.screen = function (type) {
      type = String(type);
      exec(function () {}, function () {}, 'CDVTrack', 'trackScreen', [type, ''])
    };
    exports.event = function (type, param) {
      type = String(type);
      param = param || '';
      exec(function () {}, function () {}, 'CDVTrack', 'trackEvent', [type, param])
    };
});
