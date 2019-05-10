// Handle communication with the message broker and process incoming requests.
// TODO what happens if AT launches after page?

import SchemaManager from './schema-manager.js';
import RequestManager from './request-manager.js';
import PageMessaging from './page-messaging.js';

class AtMessaging {
  constructor() {
    this.appId = Math.random().toString(26).substr(2);
    this.kNativeHostName = "org.js2at.message_broker";
  }

  // This is the id that will be passed in the appId field.
  getAppId() {
    return this.appId;
  }

  sendMessage(message) {
    console.assert(this.nativePort);
    console.log('Sending to AT', message);
    if (message.isComplete)
      RequestManager.closeRequest(message.docId, message.responseForRequestId);
    this.nativePort.postMessage(message);
  }

  onNativeMessagingDisconnected() {
    if (chrome.runtime.lastError)
      console.log(chrome.runtime.lastError.message);
    this.nativePort = null;
  }

  ensureNativeConnection() {
    // If no listeners, that means the native port was disconnected externally.
    if (this.nativePort && this.nativePort.onMessage.hasListeners()) {
      return true;
    }
    var hostName = this.kNativeHostName;
    this.nativePort = chrome.runtime.connectNative(hostName);
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (this.nativePort) {
      console.log('Native port connected', this.nativePort);
      this.nativePort.onMessage.addListener((request) => this.onRequest(request));
      this.nativePort.onDisconnect.addListener(() => this.onNativeMessagingDisconnected());
      return true;
    }
  }

  sendGeneratedErrorResponse(error, docId, requestId) {
    this.sendMessage({
      responseForRequestId: requestId,
      appId: this.getAppId(),
      docId,
      isComplete: true,
      detail: { error }
    });
  }

  // Only accept request from AT if valid, otherwise reply with error.
  onRequest(request) {
    console.log('Message received from AT', request);

    SchemaManager.validate(chrome.runtime.getURL('schema/request.json'), request)
      .then(() => {
        if (RequestManager.getRequest(request.docId, request.requestId))
          return Promise.reject('The |requestId| ' + request.requestId + ' was used more than once');

        if (request.appId !== this.getAppId())
          return Promise.reject('The |appId| does not match the current app id');

        RequestManager.openRequest(request.docId, request.requestId, request);

        // Map built-in pattern name to built-in schema url.
        if (request.pattern == '$getAllObservers') {
          return SchemaManager.validate(chrome.runtime.getURL('schema/getAllObservers.json'), { request: request.detail });
        }

        const url = new URL(request.pattern);  // Ensure parsable as URL.
        if (!url.pathname.endsWith('.json'))
          return Promise.reject('Request |pattern| must be a URL that points to a JSON document, and has .json extension.');

        if (!SchemaManager.hasPattern(request.pattern))
          return Promise.reject('No observer for this |pattern|: ' + request.pattern);

        return SchemaManager.validate(request.pattern, { request: request.detail })
      })
      .then(() => {
        PageMessaging.sendContentRequest(request);
      })
     .catch((err) => { this.sendGeneratedErrorResponse(err, request.docId, request.requestId ); });
  }
}

export default new AtMessaging();
