/**
 * Exports the ExposedJsApi.java object if available, otherwise exports the PromptBasedNativeApi.
 */

import basedNativeApi from './promptbasednativeapi';

let nativeApi = window._cordovaNative || basedNativeApi;
let currentApi = nativeApi;

export default {
  get: function () {
    return currentApi;
  },
  setPreferPrompt: function (value) {
    currentApi = value ? basedNativeApi : nativeApi;
  },
  // Used only by tests.
  set: function (value) {
    currentApi = value;
  }
};
