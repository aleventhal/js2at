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
let settings = {};
let openRequests = {}; // Track open requests and the requestType for them.

function onPagePortConnect(port) {
  if (port.name !== 'js2at')
    return;  // Not handled.

  pagePort = port;
  pagePort.onMessage.addListener(onPageMessage);
}

function onNativeMessage(request) {
  console.log('Message received from AT', request);
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

  // Only open connection is js2at us used by a page somewhere.
  // TODO should we try to close connection if all js2at content is closed?
  if (openRequests[request.requestId]) {
    console.error('The |requestId| ' + request.requestId + ' was used more than once');
    return;
  }
  validate(request.requestType, { request: request.detail })
    .then(() => {
      openRequests[request.requestId] = request.requestType;
      console.log(openRequests[request.requestId]);
      sendContentRequest(request);
    });
    // Do nothing for catch. Don't send illegal AT requests to content at all.
    // .catch((err) => {
    // });
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
//   responseForRequestId: string,
//   isComplete: boolean,
//   detail: {}
// }
function onPageMessage(message) {
  if (!ensureNativeConnection(onNativeMessage))
    return;
  const internalCommand = message['$command'];
  if (internalCommand) {
    // A $command is something internal, sent by js2at infrastructure.
    if (internalCommand === 'observerAdded') {
      loadSchema(message.type)
        .then((result) => {
          console.log('Page connected a requestType + target', message);
          sendNativeMessage(message);
        })
        .catch((error) => {
          console.error(error);
        });
      return;
    }
    else if (internalCommand == 'observerRemoved') {
      console.log('Page disconnected a requestType + target', message);
    }
  }
  else {
    console.log('Page message:', message);
    console.assert(message.responseForRequestId);
    console.assert(message.detail);
    sendNativeMessage(message);  // TODO: Don't send unless we sent observerAdded?
  }

  sendPageResponseIfValid(message);
}

function sendPageResponseIfValid(response) {
  const requestType = openRequests[response.responseForRequestId];

  if (!requestType) {
    console.error('The |responseForRequestId| of ' + response.responseForRequestId +
      ' did not correspond to an open response.');
    return;
  }

  if (response.isComplete)
    delete openRequests[response.requestId];

  if (!response.detail) {
    sendNativeMessage({
      responseForRequestId: response.responseForRequestId,
      isComplete: true,
      detail: {
        error: 'Missing required |detail| field'
      }
    });
    return;
  }

  if (response.detail.error) {
    // Error responses from the page are not currently validated, just returned.
    sendNativeMessage(response);
    return;
  }

  // Only open connection is js2at us used by a page somewhere.
  // TODO should we try to close connection if all js2at content is closed?
  validate(requestType, { response: response.detail })
    .then(() => {
      sendNativeMessage(response);
    })
    .catch((error) => {
      // Send validation error back.
      sendNativeMessage({
        responseForRequestId: response.responseForRequestId,
        isComplete: true,
        detail: {
          error
        }
      });
    });
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

function getSettings() {
  return settings;
}

function setApiFilter(apiFilter) {
  chrome.storage.sync.set({ apiFilter });
  settings.apiFilter =apiFilter;
}

function setValidation(validation) {
  chrome.storage.sync.set({ validation });
  settings.validation = validation;
}

chrome.storage.sync.get(['apiFilter', 'validation'], (storedSettings) => {
  settings = storedSettings;  // Just use. Don't resave back to storage.

  // TODO Make code DRY. These allowed values are repeated in popup.html.
  console.assert(typeof settings.apiFilter === 'undefined' ||
    settings.apiFilter === 'strict' ||
    settings.apiFilter === 'community' ||
    settings.apiFilter === 'experimental');
  settings.apiFilter = settings.apiFilter || 'community';

  console.assert(typeof settings.validation === 'undefined' ||
    settings.validation === 'none' ||
    settings.validation === 'log' ||
    settings.validation === 'reject');
  settings.validation = settings.validation || 'reject';
});

// A port is connected, indicatingthat an object on the page is listening to
// js2at requests.
chrome.runtime.onConnect.addListener(onPagePortConnect);


