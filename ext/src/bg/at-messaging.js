// Handle communication with the message broker and process incoming requests.
// TODO what happens if AT launches after page?

import SchemaManager from './schema-manager.js';
import RequestManager from './request-manager.js';
import PageMessaging from './page-messaging.js';
import Settings from './settings.js';

class AtMessaging {
  constructor() {
    this.kNativeHostName = "org.js2at.message_broker";
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
      appId: Settings.getAppId(),
      docId,
      isComplete: true,
      detail: { error: error.toString() }
    });
  }

  // Only accept request from AT if valid, otherwise reply with error.
  async onRequest(request) {
    console.log('Message received from AT', request);

    try {
      await SchemaManager.validate(chrome.runtime.getURL('schema/request.json'), request);

      if (RequestManager.getRequest(request.docId, request.requestId))
        throw new Error('The |requestId| ' + request.requestId + ' was used more than once');

      if (request.appId !== Settings.getAppId())
        throw new Error('The |appId| does not match the current app id');

      RequestManager.openRequest(request.docId, request.requestId, request);

      // Map built-in pattern name to built-in schema url.
      if (request.pattern == '$ping') {
        return SchemaManager.validate(chrome.runtime.getURL('schema/ping.json'), { request: request.detail });
      }

      const url = new URL(request.pattern);  // Ensure parsable as URL.
      if (!url.pathname.endsWith('.json'))
        throw new Error('Request |pattern| must be a URL that points to a JSON document, and has .json extension.');

      if (!SchemaManager.hasPattern(request.pattern))
        throw new Error('No observer for this |pattern|: ' + request.pattern);

      await SchemaManager.validate(request.pattern, { request: request.detail });
      PageMessaging.sendContentRequest(request);
    }
    catch(err) {
      console.error(err);
      this.sendGeneratedErrorResponse(err, request.docId, request.requestId );
    }
  }
}

export default new AtMessaging();
