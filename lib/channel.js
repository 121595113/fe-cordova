import utils from './utils'

let nextGuid = 1;

function forceFunction(f) {
  if (utils.ios) {
    if (typeof f != 'function') throw "Function required as first argument!";
  }
  if (utils.android) {
    if (typeof f !== "function" && typeof f.handleEvent !== "function") {
      throw new Error(
        "Must provide a function or an EventListener object " +
        "implementing the handleEvent interface."
      );
    }
  }
}
class Channel {
  constructor(type, sticky) {
    this.type = type;
    this.handlers = {};
    this.state = sticky ? 1 : 0;
    this.fireArgs = null;
    this.numHandlers = 0;
    this.onHasSubscribersChange = null;
  }
  // 注册函数
  subscribe(f, c) {
    forceFunction(f)
    let func = f;
    let guid;

    if (utils.android && f && typeof f === "object") {
      func = f.handleEvent;
      c = f;
    }

    //如果是stick，fire过之后，就有新来的事件触发
    if (this.state == 2) {
      f.apply(c || this, this.fireArgs)
      return
    }

    guid = f.observer_guid;
    if (typeof c == "object") {
      func = utils.close(c, f);
    }

    if (!guid) {
      guid = '' + nextGuid++;
    }
    func.observer_guid = guid;
    f.observer_guid = guid;

    if (!this.handlers[guid]) {
      this.handlers[guid] = func;
      this.numHandlers++;
      if (this.numHandlers == 1) {
        this.onHasSubscribersChange && this.onHasSubscribersChange();
      }
    }
  }

  //移除listener
  unsubscribe(f) {
    forceFunction(f)

    if (utils.android && f && typeof f === "object") {
      f = f.handleEvent;
    }

    let guid = f.observer_guid,
      handler = this.handlers[guid]
    if (handler) {
      delete this.handlers[guid];
      this.numHandlers--;
      if (this.numHandlers === 0) {
        this.onHasSubscribersChange && this.onHasSubscribersChange();
      }
    }
  }

  //触发事件 fireEvent
  fire() {
    let fail = false,
      fireArgs = Array.prototype.slice.call(arguments);
    if (this.state == 1) {
      this.state = 2;
      this.fireArgs = fireArgs;
    } //如果是 stick
    if (this.numHandlers) {
      let toCall = [];
      Object.assign(toCall, this.handlers);
      for (let i = 0; i < toCall.length; ++i) {
        toCall[i] && toCall[i].apply(this, fireArgs);
      }
      //如果是stick 那个fire之后就移除了
      if (this.state == 2 && this.numHandlers) {
        this.numHandlers = 0;
        this.handlers = {};
        this.onHasSubscribersChange && this.onHasSubscribersChange();
      }
    }
  }
}

let channel = {
  deviceReadyChannelsArray: [],
  deviceReadyChannelsMap: {},

  create: function (type) {
    return channel[type] = new Channel(type, false);
  },
  createSticky: function (type) {
    return channel[type] = new Channel(type, true);
  },
  initializationComplete: function (feature) {
    let c = this.deviceReadyChannelsMap[feature];
    c && c.fire();
  },
  join: function (h, c) {
    let len = c.length,
      i = len,
      f = function () {
        if (!(--i)) h();
      };
    for (let j = 0; j < len; j++) {
      if (c[j].state == 0) {
        throw Error('Can only use join with sticky channels.');
      }
      c[j].subscribe(f);
    }
    if (!len) h();
  },
  waitForInitialization: function (feature) {
    if (feature) {
      var c = channel[feature] || this.createSticky(feature);
      this.deviceReadyChannelsMap[feature] = c;
      this.deviceReadyChannelsArray.push(c);
    }
  }
}

export default channel;
