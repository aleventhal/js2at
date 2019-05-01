// Similate an individual message port, implemented with a single MessageChannel
// that is opened by the Extension.

let extensionPort;
let js2atMessagePorts;

function initIfNecessary() {
  if (js2atMessagePorts)
    return;
  js2atMessagePorts = new Map();
  const channel = new MessageChannel();
  extensionPort = channel.port1;
  window.postMessage('js2atChannelInit', '*', [channel.port2]);  // window.location.origin, ?
  extensionPort.onmessage = onMessageFromExtension;  // Transfer to background script.
}

function getPort(type, uid) {
  console.assert(type);
  console.assert(uid);
  const portName = getPortName(type, uid);
  const port = js2atMessagePorts.get(portName)
  console.assert(port, 'No port found for this type and uid');
  return port;
}
function getPortName(type, uid) {
  return type + '::' + uid;
}

function onMessageFromExtension(message) {
  const data = message.data;
  console.assert(data.requestType);
  console.assert(data.targetUid);
  const js2atMessagePort = getPort(data.requestType, data.targetUid);

  if (data['$command']) {
    if (data['$command'] == 'disconnect')
      js2atMessagePort.onDisconnect(js2atMessagePort);
    return;
  }

  js2atMessagePort.onRequest(data);
}

function sendMessageToExtension(data) {
  console.assert(extensionPort);
  if (extensionPort)
    extensionPort.postMessage(data);
}

export default class Js2atMessagePort {
  constructor(type, uid, onDisconnectCallback) {
    initIfNecessary();
    this.type = type;
    this.uid = uid;
    this.onDisconnect = onDisconnectCallback;
    this.listeners = [];
    const portName = getPortName(type, uid);
    js2atMessagePorts.set(portName, this);
    sendMessageToExtension({ "$command": "observerAdded", type, uid });
  }

  addListener(listener) {
    console.assert(listener);
    this.listeners.push(listener);
  }

  removeListener(listener) {
    const index = listeners.indexOf(listener);
    console.assert(index >= 0);
    this.listeners.splice(index, 1);

    sendMessageToExtension({ "$command": "observerRemoved", type: this.type,
      type: this.uid });
  }

  onRequest(data) {
    for (const listener of this.listeners)
      listener(data);
  }

  postMessage(data) {
    console.assert(data.responseForRequestId);
    console.assert(data.isComplete);
    console.assert(data.detail);
    sendMessageToExtension(data);
  }
}

