/**
 * Implements the API of ExposedJsApi.java, but uses prompt() to communicate.
 * This is used pre-JellyBean, where addJavascriptInterface() is disabled.
 */

export default {
  exec: function (bridgeSecret, service, action, callbackId, argsJson) {
    return prompt(argsJson, 'gap:' + JSON.stringify([bridgeSecret, service, action, callbackId]));
  },
  setNativeToJsBridgeMode: function (bridgeSecret, value) {
    prompt(value, 'gap_bridge_mode:' + bridgeSecret);
  },
  retrieveJsMessages: function (bridgeSecret, fromOnlineEvent) {
    return prompt(+fromOnlineEvent, 'gap_poll:' + bridgeSecret);
  }
}
