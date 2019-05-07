// Handle communication with the js2at native broker and process incoming requests.
// TODO what happens if AT launches after page?
// TODO handle multiple tabs.
let nativePort;

console.log('sendMessageToAT({ responseObj }) will send a message to an AT');
console.log('onRequestFromAT({ requestObj }) will simulate a message from an AT');

// This is the id that will be passed in the appId field.
function getAppId() {
  getAppId.id = getAppId.id || Math.random().toString(26).substr(2);
  return getAppId.id;
}

function sendMessageToAT(message) {
  console.log('Sending to AT', message);
  nativePort.postMessage(message);
}

function onNativeMessagingDisconnected() {
  if (chrome.runtime.lastError)
    console.log(chrome.runtime.lastError.message);
  nativePort = null;
}

function ensureNativeConnection() {
  // If no listeners, that means the native port was disconnected externally.
  if (nativePort && nativePort.onMessage.hasListeners()) {
    return true;
  }
  var hostName = "org.js2at.message_broker";
  nativePort = chrome.runtime.connectNative(hostName);
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }
  if (nativePort) {
    console.log('Native port connected', nativePort);
    nativePort.onMessage.addListener(onRequestFromAT);
    nativePort.onDisconnect.addListener(onNativeMessagingDisconnected);
    return true;
  }
}

function sendGeneratedErrorResponseToAT(error, requestId) {
  console.log(error);
  if (typeof requestId !== 'undefined')
    delete openRequests[requestId];
  sendMessageToAT({
    responseForRequestId: requestId,
    isComplete: true,
    detail: { error }
  });
}

// Only accept request from AT if valid, otherwise reply with error.
function onRequestFromAT(request) {
  console.log('Message received from AT', request);

  validateUsingInternalSchema('request', kRequestSchema, request)
    .then(() => {
      if (openRequests[request.requestId]) {
        return Promise.reject('The |requestId| ' + request.requestId + ' was used more than once');
      }
      const url = new URL(request.pattern);  // Ensure parsable as URL.
      if (!url.pathname.endsWith('.json'))
        return Promise.reject('Request |pattern| must be a URL that points to a JSON document, and has .json extension.');

      if (!cachedSchemas[request.pattern])
        return Promise.reject('No observer for this |pattern|: ' + request.pattern);

      if (request.appId !== getAppId())
        return Promise.reject('The |appId| does not match the current app id');
    })
    .then(() => {
      return validateUsingSchemaUrl(request.pattern, { request: request.detail })
    })
    .then(() => {
      openRequests[request.requestId] = request.pattern;
      sendContentRequest(request);
    })
   .catch((err) => { sendGeneratedErrorResponseToAT(err, request.requestId ); });
}
