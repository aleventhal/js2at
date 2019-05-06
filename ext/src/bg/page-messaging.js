let pagePort;
let openRequests = {}; // Track open requests and the requestType for them.

function sendContentRequest(request) {
  pagePort.postMessage(request);
}

function onPageMessage(message) {
  if (!ensureNativeConnection(onRequestFromAT))
    return;
  if (message['$command']) {
    processInternalPageCommand(message);
    return;
  }
  else {
    console.log('Page message:', message);
    sendPageResponseOrError(message);
  }
}

function processInternalPageCommand(message) {
  internalCommand = message['$command'];
  // A $command is something internal, sent by js2at infrastructure.
  if (internalCommand === 'observerAdded') {
    validateUsingInternalSchema('observerChange', kObserverChangeSchema, message)
    .then(loadSchema(message.type))
    .then(() => {
      console.log('Page connected a requestType + target', message);
      sendMessageToAT(message);
    })
    .catch((err) => { sendGeneratedErrorResponseToAT(err, message.responseForRequestId ); });
  }
  else if (internalCommand == 'observerRemoved') {
    validateUsingInternalSchema('observerChange', kObserverChangeSchema, message)
    .then(() => {
      if (!hasSchema(type)) {  // TODO track by object in a given page?
        console.error('Attempting to remove a schema that was never loaded: ' + type);
      }
      else {
        console.log('Page removed a requestType + target', message);
        sendMessageToAT(message);
      }
    })
    .catch((err) => { sendGeneratedErrorResponseToAT(err, message.responseForRequestId ); });
  }
  else
    console.error('Unsupported internal command: ' + internalCommand);
}

function sendPageResponseOrError(response) {
  validateUsingInternalSchema('response', kResponseSchema, response)
  .then(() => {
    const requestType = openRequests[response.responseForRequestId];
    if (!requestType)
      return Promise.reject('The |responseForRequestId| did not correspond to an open response');

    if (response.isComplete)
      delete openRequests[response.responseForRequestId];

    if (response.detail.error) {
      // Error detail is not currently validated, just returned.
      // TODO Build internal schema for detail: { error } case.
      console.assert(response.isComplete === true);
      return response
    }
    return validateUsingSchemaUrl(requestType, { response: response.detail });
  })
  .then(() => { sendMessageToAT(response); })
  .catch((err) => { sendGeneratedErrorResponseToAT(err, response.responseForRequestId ); });
}

function onPagePortConnect(port) {
  // TODO Manage tabs. Add disconnect handler.
  if (port.name !== 'js2at')
    return;  // Not handled.

  pagePort = port;
  pagePort.onMessage.addListener(onPageMessage);
}

// A port is connected, indicatingthat an object on the page is listening to
// js2at requests.
chrome.runtime.onConnect.addListener(onPagePortConnect);
