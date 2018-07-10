import channel from './channel';
import utils from './utils';
import originCDV from './originCDV';
import exec from './exec-android';
// The last resume event that was received that had the result of a plugin call.
var lastResumeEvent = null;

let iosBootstrap = () => {
  channel.onNativeReady.fire();
};

let androidBootstrap = () => {
  // modulemapper = require('cordova/modulemapper');

  // Get the shared secret needed to use the bridge.
  exec.init();

  // TODO: Extract this as a proper plugin.
  // modulemapper.clobbers('cordova/plugin/android/app', 'navigator.app');

  var APP_PLUGIN_NAME = 'CoreAndroid';

  // Inject a listener for the backbutton on the document.
  var backButtonChannel = originCDV.addDocumentEventHandler('backbutton');
  backButtonChannel.onHasSubscribersChange = function () {
    // If we just attached the first handler or detached the last handler,
    // let native know we need to override the back button.
    exec(null, null, APP_PLUGIN_NAME, "overrideBackbutton", [this.numHandlers == 1]);
  };

  // Add hardware MENU and SEARCH button handlers
  originCDV.addDocumentEventHandler('menubutton');
  originCDV.addDocumentEventHandler('searchbutton');

  function bindButtonChannel(buttonName) {
    // generic button bind used for volumeup/volumedown buttons
    var volumeButtonChannel = originCDV.addDocumentEventHandler(buttonName + 'button');
    volumeButtonChannel.onHasSubscribersChange = function () {
      exec(null, null, APP_PLUGIN_NAME, "overrideButton", [buttonName, this.numHandlers == 1]);
    };
  }
  // Inject a listener for the volume buttons on the document.
  bindButtonChannel('volumeup');
  bindButtonChannel('volumedown');

  // The resume event is not "sticky", but it is possible that the event
  // will contain the result of a plugin call. We need to ensure that the
  // plugin result is delivered even after the event is fired (CB-10498)
  var cordovaAddEventListener = document.addEventListener;

  document.addEventListener = function (evt, handler, capture) {
    cordovaAddEventListener(evt, handler, capture);

    if (evt === 'resume' && lastResumeEvent) {
      handler(lastResumeEvent);
    }
  };

  // Let native code know we are all done on the JS side.
  // Native code will then un-hide the WebView.
  channel.onCordovaReady.subscribe(function () {
    exec(onMessageFromNative, null, APP_PLUGIN_NAME, 'messageChannel', []);
    exec(null, null, APP_PLUGIN_NAME, "show", []);
  });
};

function onMessageFromNative(msg) {
  var action = msg.action;

  switch (action) {
    // Button events
    case 'backbutton':
    case 'menubutton':
    case 'searchbutton':
      // App life cycle events
    case 'pause':
      // Volume events
    case 'volumedownbutton':
    case 'volumeupbutton':
      originCDV.fireDocumentEvent(action);
      break;
    case 'resume':
      if (arguments.length > 1 && msg.pendingResult) {
        if (arguments.length === 2) {
          msg.pendingResult.result = arguments[1];
        } else {
          // The plugin returned a multipart message
          var res = [];
          for (var i = 1; i < arguments.length; i++) {
            res.push(arguments[i]);
          }
          msg.pendingResult.result = res;
        }

        // Save the plugin result so that it can be delivered to the js
        // even if they miss the initial firing of the event
        lastResumeEvent = msg;
      }
      originCDV.fireDocumentEvent(action, msg);
      break;
    default:
      throw new Error('Unknown event action ' + action);
  }
}

export default {
  id: utils.android ? 'android' : 'ios',
  bootstrap: utils.android ? androidBootstrap : iosBootstrap
};
