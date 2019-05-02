/* eslint parserOptions: ["sourceType", "module"] */
// Similate an individual message port, implemented with a single MessageChannel
// that is opened by the Extension.

import Js2atMessagePortManager from './js2at-message-port-manager.js';

export default class Js2atMessagePort {
  constructor(type, uid, onRequestCallback, onDisconnectCallback) {
    this.type = type;
    this.uid = uid;
    this.onRequest = onRequestCallback;
    this.onDisconnect = () => {
      onDisconnectCallback(this);
      Js2atMessagePortManager.sendMessageToExtension({
        "$command": "observerRemoved",
        type,
        uid
      });
    }
    Js2atMessagePortManager.setPort(type, uid, this);
    Js2atMessagePortManager.sendMessageToExtension({
      "$command": "observerAdded",
      type,
      uid
    });
  }

  disconnect() {
    Js2atMessagePortManager.removePort(this.type, this.uid);
    this.onDisconnect();
  }

  postMessage(data) {
    console.assert(data.responseForRequestId);
    console.assert(data.isComplete);
    console.assert(data.detail);
    Js2atMessagePortManager.sendMessageToExtension(data);
  }
}

