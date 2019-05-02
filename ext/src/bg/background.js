/**
 * 1. Send and receive messages from the web page
 * 2. Send and receive messages from native messaging broker
 *    (uses native-messaging.js to do the actual work)
 * 3. Validate messages (TODO)
 */

// TODO what happens if AT launches after page?
// TODO one port per tab.

let requestId = 1;
let targetUid;
let pagePort;

function onPagePortConnect(port) {
  if (port.name !== 'js2at')
    return;  // Not handled.

  pagePort = port;
  pagePort.onMessage.addListener(onPageMessage);
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

  sendContentRequest(request);
}

function sendContentRequest(request) {
  pagePort.postMessage(request);
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

// Format:
// {
//   responseForMessageId: string,
//   isComplete: boolean,
//   detail: {}
// }
function onPageMessage(message) {
  const internalCommand = message['$command'];
  if (internalCommand) {
    // A $command is something internal, sent by js2at infrastructure.
    if (internalCommand === 'observerAdded')
      console.log('Page connected a requestType + target', message);
    else if (internalCommand == 'observerRemoved')
      console.log('Page disconnected a requestType + target', message);
  }
  else {
    console.log('Page message:', message);
    // TODO should we verify that this specific request is open, or leave to AT?
    console.assert(message.responseForRequestId);
    console.assert(message.detail);
  }
  // Only open connection is js2at us used by a page somewhere.
  // TODO should we try to close connection if all js2at content is closed?
  if (ensureNativeConnection(onNativeMessage))
    sendNativeMessage(message);
}

function onPagePortDisconnect(port) {
  const observerInfo = parseObserverName(port.name);
  if (!observerInfo)
    return;  // Not handled.
  console.log('Page port disconnected', observerInfo);
  const { requestType, targetUid } = observerInfo;
  delete pagePorts[requestType][targetUid];
  sendNativeMessage({
    command: "$disconnect",
    type: requestType,
    uid: targetUid
  });
}

// A port is connected, indicatingthat an object on the page is listening to
// js2at requests.
chrome.runtime.onConnect.addListener(onPagePortConnect);


