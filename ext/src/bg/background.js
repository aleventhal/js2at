/**
 * 1. Send and receive messages from the web page
 * 2. Send and receive messages from native messaging broker
 *    (uses native-messaging.js to do the actual work)
 * 3. Validate messages (TODO)
 */

// TODO track all the ports, ids, types, etc.
let requestId = 1;
let pagePorts = {};  // Observer map indexed via [requestType][targetUid].
let targetUid;

function onPagePortConnect(port) {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }

  if (!port.name.startsWith('js2at::'))
    return;  // Not handled.

  // TODO what happens if lots of observers were created before the native
  // connection could be created?
  if (!ensureNativeConnection(onNativeMessage))
    return;

  const observerInfo = parseObserverName(port.name);
  if (!observerInfo)
    return;  // Not handled.
  // A new port has opened to listen to a single request type on a single
  // object.
  console.log('Page connected a requestType + target', observerInfo);
  const { requestType, targetUid } = observerInfo;
  if (!pagePorts[requestType]) {
    pagePorts[requestType] = {};
  }
  pagePorts[requestType][targetUid] = port;

  port.onMessage.addListener(onPageMessage);
  port.onDisconnect.addListener(onPagePortDisconnect);
  sendNativeMessage({
    observerAdded: requestType,
    targetUid
  });
}

function onNativeMessage(request) {
  console.log('Message received from AT', request);
  // Handle special built-in requests (not a URL request Type).
  if (request.ping)
    return;

  // Validate requestId.
  console.assert(request.requestId, 'Request |requestId| required.');

  // Validate type.
  console.assert(request.requestType, 'Request |requestType| is required.');
  const url = new URL(request.requestType);  // Ensure parsable as URL.
  console.assert(url.pathname.endsWith('.json'),
    'Request |type| must be a URL that points to a JSON document, and has .json extension.');

  // Validate targetUid.
  console.assert(request.targetUid), 'Request |targetUid| required.';

  // Validate timeout (optional).
  console.assert(!request.hasOwnProperty('timeout') || (Number.isInteger(request.timeout) && request.timeout > 0),
    'If request |timeout| present, it must be positive integer');

  // Validate multiSend (optional).
  console.assert(!request.hasOwnProperty('multiSend') || typeof request.multiSend === 'boolean',
    'If request |multiSend| present, it must be a boolean');

  // Validate detail.
  // TODO Should be able to validate this against the schema specified by |type|.
  console.assert(request.detail && typeof request.detail === 'object',
    'Request |detail| must be present and an object.');

  // Our page ports map needs to be storing per tab, or let each contentscript handle this.
  console.assert(pagePorts[request.requestType] && pagePorts[request.requestType][request.targetUid],
    'Page must be listening to requests of this type, for this targetUid');

  sendContentRequest(request);
}

function sendContentRequest(request) {
  pagePorts[request.requestType][request.targetUid].postMessage(request);
}

function parseObserverName(name) {
  if (!name.startsWith('js2at::'))
    return;  // Not handled.

  const params = name.split('::');
  return {
    requestType: params[1],
    targetUid: params[2]
  };
}

function onPageMessage(message) {
  console.log('background.js --  onPageMessage', message);
  // TODO should we validate that this request exists and is open?
  console.assert(message.responseForRequestId);
  sendNativeMessage(message);
}

function onPagePortDisconnect(port) {
  const observerInfo = parseObserverName(port.name);
  if (!observerInfo)
    return;  // Not handled.
  // A new port has opened to listen to a single request type on a single
  // object.
  console.log('Page port disconnected', observerInfo);
  const { requestType, targetUid } = observerInfo;
  delete pagePorts[requestType][targetUid];
  sendNativeMessage({
    observerRemoved: requestType,
    targetUid
  });
}

// A port is connected, indicatingthat an object on the page is listening to
// js2at requests.
chrome.runtime.onConnectExternal.addListener(onPagePortConnect);


