/* eslint parserOptions: ["sourceType", "module"] */
// Singleton that manages message ports mapped by target uid x pattern.
// Only one port is allowed for each target uid x pattern combination, which
// means that an error will be thrown if a website tries to observe the same
// type of request on the same object twice. The reason for this restriction
// is that having multiple listeners could cause race condition bugs where
// two pieces of code are both attempting to respond to the same request.

import Js2atUniqueIdManager from './js2at-unique-id-manager.js';

class Js2atMessagePortManager {
  initIfNecessary() {
    if (this.js2atMessagePorts)
      return;  // Already initialized.
    // This will be a map of maps.
    // The first level map is by uid, the second level is by request pattern.
    this.js2atMessagePorts = new Map();
    // Initialize communication with extension.
    const channel = new MessageChannel();
    this.extensionPort = channel.port1;
    window.postMessage('js2atChannelInit', '*', [channel.port2]);  // window.location.origin, ?
    this.extensionPort.onmessage = (data) => {
      this.onMessageFromExtension(data);  // Transfer to background script.
    };
    Js2atUniqueIdManager.addUidRemovedListener((uid) => {
      let mapByUid = this.js2atMessagePorts.get(uid);
      if (mapByUid) {
        mapByUid.forEach((port) => {
          port.disconnect();
        });
      }
    });
  }

  getAllObservers() {
    // Return an array of objects, each with a uid and array of patterns.
    const allObserversByUid = {};
    for (let [uid, mapByUid] of this.js2atMessagePorts.entries()) {
      for (let pattern of mapByUid.keys()) {
        allObserversByUid[uid] = allObserversByUid[uid] || [];
        allObserversByUid[uid].push(pattern);
      }
    }
    const result = [];
    for (let [uid, patterns] of Object.entries(allObserversByUid))
      result.push({ uid, patterns });
    return result;
  }

  setPort(pattern, uid, port) {
    console.assert(pattern);
    console.assert(uid);
    console.assert(port);
    this.initIfNecessary();
    let mapByUid = this.js2atMessagePorts.get(uid);
    if (!mapByUid) {
      mapByUid = new Map();
      this.js2atMessagePorts.set(uid, mapByUid);
    }
    if (mapByUid.has(pattern))
      throw new Error('Js2at observer already exists for this uid and pattern.');
    mapByUid.set(pattern, port);
  }

  removePort(pattern, uid) {
    console.assert(pattern);
    console.assert(uid);
    let mapByUid = this.js2atMessagePorts.get(uid);
    if (!mapByUid) {
      console.error('No js2at ports to remove for this uid.');
      return;
    }
    if (!mapByUid.has(pattern))
      console.error('No js2at ports to remove for this uid and pattern.');
    mapByUid.delete(pattern);
  }

  getPort(pattern, uid) {
    console.assert(pattern);
    console.assert(uid);
    let mapByUid = this.js2atMessagePorts.get(uid);
    if (!mapByUid) {
      console.error('No js2at ports for this uid.');
      return;
    }
    const port = mapByUid.get(pattern);
    if (!port)
      console.error('No js2at ports for this uid and pattern.');
    return port;
  }

  onMessageFromExtension(message) {
    const data = message.data;
    console.assert(data.pattern);
    console.assert(data.uid);
    console.log(data.pattern);
    if (data.pattern == '$getAllObservers') {
      // Special case. AT wants to discover all current observers.
      // For this observer, the uid is unused, and should be '*'.
      console.assert(data.uid === '*');
      this.sendMessageToExtension({
        responseForRequestId: data.requestId,
        isComplete: true,
        detail: {
          observers: this.getAllObservers()
        }
      });
      return;
    }
    const js2atMessagePort = this.getPort(data.pattern, data.uid);
    if (!js2atMessagePort) {
      if (data.requestId) {
        this.sendMessageToExtension({
          responseForRequestId: data.requestId,
          isComplete: true,
          detail: {
            error: 'No js2at observer for this uid and pattern.'
          }
        });
      }
      return;
    }

    if (data['$command']) {
      if (data['$command'] == 'disconnect')
        js2atMessagePort.disconnect(js2atMessagePort);
      return;
    }

    js2atMessagePort.onRequest(data);
  }

  sendMessageToExtension(data) {
    console.assert(this.extensionPort);
    if (this.extensionPort)
      this.extensionPort.postMessage(data);
  }
}

export default new Js2atMessagePortManager();

