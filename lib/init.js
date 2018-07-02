import channel from './channel';
import cordova from './cordova2';
// import * as modulemapper from './modulemapper';
import platform from './platform';
// import pluginloader from './pluginloader';
import utils from './utils';

var platformInitChannelsArray = [channel.onNativeReady, channel.onPluginsReady];

function logUnfiredChannels(arr) {
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i].state != 2) {
      console.log('Channel not fired: ' + arr[i].type);
    }
  }
}

window.setTimeout(function () {
  if (channel.onDeviceReady.state != 2) {
    console.log('deviceready has not fired after 5 seconds.');
    logUnfiredChannels(platformInitChannelsArray);
    logUnfiredChannels(channel.deviceReadyChannelsArray);
  }
}, 5000);

// Replace navigator before any modules are required(), to ensure it happens as soon as possible.
// We replace it so that properties that can't be clobbered can instead be overridden.
function replaceNavigator(origNavigator) {
  var CordovaNavigator = function () {};
  CordovaNavigator.prototype = origNavigator;
  var newNavigator = new CordovaNavigator();
  // This work-around really only applies to new APIs that are newer than Function.bind.
  // Without it, APIs such as getGamepads() break.
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
  // yutao change
  // window.navigator = replaceNavigator(window.navigator);
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

// Register pause, resume and deviceready channels as events on document.
channel.onPause = cordova.addDocumentEventHandler('pause');
channel.onResume = cordova.addDocumentEventHandler('resume');
channel.onActivated = cordova.addDocumentEventHandler('activated');
channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');

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

// yutao comment
// modulemapper.clobbers('cordova', 'cordova');
// modulemapper.clobbers('cordova/exec', 'cordova.exec');
// modulemapper.clobbers('cordova/exec', 'Cordova.exec');

// Call the platform-specific initialization.
platform.bootstrap && platform.bootstrap();

// Wrap in a setTimeout to support the use-case of having plugin JS appended to cordova.js.
// The delay allows the attached modules to be defined before the plugin loader looks for them.
setTimeout(function () {
  // yutao change
  // pluginloader.load(function () {
  channel.onPluginsReady.fire();
  // });
}, 0);

/**
 * Create all cordova objects once native side is ready.
 */
channel.join(function () {
  // modulemapper.mapModules(window);

  platform.initialize && platform.initialize();

  // Fire event to notify that all objects are created
  channel.onCordovaReady.fire();

  // Fire onDeviceReady event once page has fully loaded, all
  // constructors have run and cordova info has been received from native
  // side.
  channel.join(function () {
    cordova.fireDocumentEvent('deviceready');
  }, channel.deviceReadyChannelsArray);

}, platformInitChannelsArray);
