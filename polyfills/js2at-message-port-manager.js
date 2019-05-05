/* eslint parserOptions: ["sourceType", "module"] */
// Singleton that manages message ports mapped by target x requestType.
// Only one port is allowed for each target x requestType combination, which
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
    // The first level map is by uid, the second level is by request type.
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

  setPort(type, uid, port) {
    console.assert(type);
    console.assert(uid);
    console.assert(port);
    this.initIfNecessary();
    let mapByUid = this.js2atMessagePorts.get(uid);
    if (!mapByUid) {
      mapByUid = new Map();
      this.js2atMessagePorts.set(uid, mapByUid);
    }
    if (mapByUid.has(type))
      throw new Error('Js2at observer already exists for this target and type.');
    mapByUid.set(type, port);
  }

  removePort(type, uid) {
    console.assert(type);
    console.assert(uid);
    let mapByUid = this.js2atMessagePorts.get(uid);
    if (!mapByUid) {
      console.error('No js2at ports to remove for this uid.');
      return;
    }
    if (!mapByUid.has(type))
      console.error('No js2at ports to remove for this uid and type.');
    mapByUid.delete(type);
  }

  getPort(type, uid) {
    console.assert(type);
    console.assert(uid);
    let mapByUid = this.js2atMessagePorts.get(uid);
    if (!mapByUid) {
      console.error('No js2at ports for this uid.');
      return;
    }
    const port = mapByUid.get(type);
    if (!port)
      console.error('No js2at ports for this uid and type.');
    return port;
  }

  onMessageFromExtension(message) {
    const data = message.data;
    console.assert(data.requestType);
    console.assert(data.targetUid);
    const js2atMessagePort = this.getPort(data.requestType, data.targetUid);
    if (!js2atMessagePort) {
      if (data.requestId) {
        this.sendMessageToExtension({
          responseForRequestId: data.requestId,
          isComplete: true,
          detail: {
            error: 'No js2at observer for this targetUid and requestType.'
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
