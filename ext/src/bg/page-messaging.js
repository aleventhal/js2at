import AtMessaging from './at-messaging.js';
import SchemaManager from './schema-manager.js';
import RequestManager from './request-manager.js';

class PageMessaging {
  constructor() {
    this.pagePorts = {};  // Indexed by docId.
    chrome.runtime.onConnect.addListener((port) => this.onPagePortConnect(port));
  }

  sendContentRequest(request) {
    console.log('Send to content', request);
    const pagePort = this.pagePorts[request.docId];
    if (pagePort) {
      console.log('Send to content #2');
      pagePort.postMessage(request);
    }
  }

  getDocId(port) {
    return port.sender.tab.id.toString() + '.' + port.sender.frameId;
  }

  onPageMessage(message, port, callback) {
    if (!AtMessaging.ensureNativeConnection())
      return;
    // Add automatically populated fields.
    message.appId = AtMessaging.getAppId();
    message.docId = this.getDocId(port);

    if (message['$command']) {
      // TODO this is a hacky setup, but will suffice for now.
      if (message['$command'] == 'initIds')
        callback(message.appId, message.docId);
      else {
        this.processInternalPageCommand(message);
      }
      return;
    }
    else {
      this.sendPageResponseOrError(message);
    }
  }

  processInternalPageCommand(message) {
    const internalCommand = message['$command'];
    // A $command is something internal, sent by js2at infrastructure.
    if (internalCommand === 'observerAdded') {
      SchemaManager.validate(chrome.runtime.getURL('schema/observerChange.json'), message)
      .then(SchemaManager.preparePattern(message.pattern))
      .then(() => {
        AtMessaging.sendMessage(message);
      })
      .catch((err) => { AtMessaging.sendGeneratedErrorResponse(err, message.docId, message.responseForRequestId ); });
    }
    else if (internalCommand == 'observerRemoved') {
      SchemaManager.validate(chrome.runtime.getURL('schema/observerChange.json'), message)
      .then(() => {
        // Cancel all open requests for this observer.
        const openRequestIds = RequestManager.getRequestIds(message.docId, message.pattern, message.uid);
        for (let openRequestId of openRequestIds)
          AtMessaging.sendGeneratedErrorResponse('Cancelled because observer removed', message.docId, openRequestId);
        // Sanity check, check if schema was loaded.
        if (!SchemaManager.hasPattern(message.pattern)) {  // TODO track by object in a given page?
          console.error('Attempting to remove a schema that was never loaded: ' + message.pattern);
        }
        else {
          console.log('Page removed a pattern + target uid', message);
          AtMessaging.sendMessage(message);
        }
      })
      .catch((err) => { AtMessaging.sendGeneratedErrorResponse(err, message.docId, message.responseForRequestId ); });
    }
    else
      throw new Error('Unsupported internal command: ' + internalCommand);
  }

  sendPageResponseOrError(response) {
    const request = RequestManager.getRequest(response.docId, response.responseForRequestId);
    if (!request)
      return Promise.reject('Could not find corresponding open request for this |responseForRequestId| and |docId|');

    SchemaManager.validate(chrome.runtime.getURL('schema/response.json'), response)
    .then(() => {
      if (response.detail.error) {
        // Error detail is not currently validated, just returned.
        // TODO Build internal schema for detail: { error } case.
        console.assert(response.isComplete === true);
        return response;
      }
      const schemaUrl = request.pattern === '$getAllObservers' ?
        chrome.runtime.getURL('schema/getAllObservers.json') :
        request.pattern;
      return SchemaManager.validate(schemaUrl, { response: response.detail });
    })
    .then(() => { AtMessaging.sendMessage(response); })
    .catch((err) => { AtMessaging.sendGeneratedErrorResponse(err, response.docId, response.responseForRequestId ); });
  }

  onPagePortConnect(port) {
    // TODO Manage tabs. Add disconnect handler.
    if (port.name !== 'js2at')
      return;  // Not handled.

    // A port is connected, indicating that an object on the page is listening to
    // js2at requests.
    const docId = this.getDocId(port); // Also available: tab.windowId for containing window.
    console.assert(!this.pagePorts[docId], "A page port was already connected for this docId");
    this.pagePorts[docId] = port;
    port.onMessage.addListener((message, port, callback) =>
      this.onPageMessage(message, port, callback));
    port.onDisconnect.addListener((port) => {
      // TODO: cancel all pending requests (send error responses).
      // TODO: send observerRemoved (do this in the polyfill?)
      delete this.pagePorts[docId];
    });

    setTimeout(() => {
      // After port connects, send it an initial hellp message with ids.
      port.postMessage({
        '$command': 'initIds',
        appId: AtMessaging.getAppId(),
        docId
      });
    }, 0);
  }
}

export default new PageMessaging();
