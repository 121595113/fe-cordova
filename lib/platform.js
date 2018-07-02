import channel from './channel';

export default {
  id: 'ios',
  bootstrap: function () {
    channel.onNativeReady.fire();
  }
};
