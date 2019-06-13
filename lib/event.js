import channel from './channel';
import originCDV from './originCDV';
import platform from './platform';
import utils from './utils';

function replaceNavigator(origNavigator) {
  var CordovaNavigator = function () {};
  CordovaNavigator.prototype = origNavigator;
  var newNavigator = new CordovaNavigator();
  if (CordovaNavigator.bind) {
    for (var key in origNavigator) {
      if (typeof origNavigator[key] == 'function') {
        newNavigator[key] = origNavigator[key].bind(origNavigator);
      } else {
        (function (k) {
          utils.defineGetterSetter(newNavigator, key, function () {
            return origNavigator[k];
          });
        })(key);
      }
    }
  }
  return newNavigator;
}

if (window.navigator) {
  replaceNavigator(window.navigator);
}

if (!window.console) {
  window.console = {
    log: function () {}
  };
}
if (!window.console.warn) {
  window.console.warn = function (msg) {
    this.log("warn: " + msg);
  };
}

export function eventMixin(Corodva) {
  Corodva.prototype.$channel = channel;
  // 将originCDV中的方法添加到Corodva原型上
  for (let item in originCDV) {
    if (typeof originCDV[item] === 'function') {
      Corodva.prototype[item] = originCDV[item];
    }
  }

  Corodva.prototype.initEvent = () => {
    channel.createSticky('onDOMContentLoaded');
    channel.createSticky('onNativeReady');
    channel.createSticky('onCordovaReady');
    channel.createSticky('onPluginsReady');
    channel.waitForInitialization('onCordovaReady');
    channel.waitForInitialization('onDOMContentLoaded');

    var platformInitChannelsArray = [channel.onNativeReady, channel.onPluginsReady];

    channel.onPause = originCDV.addDocumentEventHandler('pause');
    channel.onResume = originCDV.addDocumentEventHandler('resume');
    channel.onDeviceReady = originCDV.addStickyDocumentEventHandler('deviceready');

    // Listen for DOMContentLoaded and notify our channel subscribers.
    if (document.readyState == 'complete' || document.readyState == 'interactive') {
      channel.onDOMContentLoaded.fire();
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        channel.onDOMContentLoaded.fire();
      }, false);
    }

    // _nativeReady is global variable that the native side can set
    // to signify that the native code is ready. It is a global since
    // it may be called before any cordova JS is ready.
    if (window._nativeReady) {
      channel.onNativeReady.fire();
    }

    // Call the platform-specific initialization.
    platform.bootstrap && platform.bootstrap();

    /**
     * Create all cordova objects once native side is ready.
     */
    channel.join(function () {
      platform.initialize && platform.initialize();

      // Fire event to notify that all objects are created
      channel.onCordovaReady.fire();

      // Fire onDeviceReady event once page has fully loaded, all
      // constructors have run and cordova info has been received from native
      // side.
      channel.join(function () {
        originCDV.fireDocumentEvent('deviceready');
      }, channel.deviceReadyChannelsArray);

    }, platformInitChannelsArray);
  }

  Corodva.prototype.on = (eventName, cb) => {
    document.addEventListener(eventName, cb, false);
  }

  Corodva.prototype.off = (eventName, cb) => {
    document.removeEventListener(eventName, cb, false);
  }

  Corodva.prototype.once = (eventName, cb) => {
    let _cb = function () {
      cb.apply(null, arguments);
      document.removeEventListener(eventName, _cb, false);
    };
    document.addEventListener(eventName, _cb, false);
  }
}
