// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Handle communication with the message broker and process incoming requests.
// TODO what happens if AT launches after page?

import SchemaManager from './schema-manager.js';
import RequestManager from './request-manager.js';
import PageMessaging from './page-messaging.js';
import Settings from './settings.js';

function isChromeVox() {
  return /\bCrOS\b/.test(navigator.userAgent);
}

const kChromeVoxExtensionId = 'mndnfokpggljbaajbnioimlmbfngpief';

class AtMessaging {
  constructor() {
  }

  sendMessage(message) {
    if (!this.port)
      throw new Error('No port to send AT messages to');
    console.log('Sending to AT', message);
    if (message.isComplete)
      RequestManager.closeRequest(message.docId, message.responseForRequestId);
    this.port.postMessage(message);
  }

  onDisconnected() {
    console.log('AT port disconnected');
    if (browser.runtime.lastError)
      console.log(browser.runtime.lastError.message);
    this.port = null;
  }

  ensureNativeConnection() {
    // If no listeners, that means the native port was disconnected externally.
    const kNativeHostName = "org.js2at.message_broker";
    const port = browser.runtime.connectNative(kNativeHostName);
    if (browser.runtime.lastError)
      console.log(browser.runtime.lastError);
    else
      return port;
  }

  ensureExtensionConnection(extensionId, name) {
    const port = browser.runtime.connect(extensionId, { name });
    if (browser.runtime.lastError)
      console.log(browser.runtime.lastError);
    else
      return port;
  }

  ensureAtConnection() {
    if (this.port)
      return true;
    this.port= isChromeVox() ?
      this.ensureExtensionConnection(kChromeVoxExtensionId, 'js2at->cvox') :
      this.ensureNativeConnection();
    if (!this.port)
      return;
    console.log('AT port connected', this.port);
    this.port.onMessage.addListener((request) => this.onRequest(request));
    this.port.onDisconnect.addListener(() => this.onDisconnected());
    return true;
  }

  sendGeneratedErrorResponse(error, docId, requestId) {
    // Use toString() on Error type, rather than JSON.stringify, which returns {}
    if (error instanceof Error)
      error = error.toString();
    this.sendMessage({
      responseForRequestId: requestId,
      appId: Settings.getAppId(),
      docId,
      isComplete: true,
      detail: { error }
    });
  }

  // Only accept request from AT if valid, otherwise reply with error.
  async onRequest(request) {
    console.log('Message received from AT', request);

    try {
      await SchemaManager.validate(browser.runtime.getURL('schema/request.json'), request);

      if (RequestManager.getRequest(request.docId, request.requestId))
        return Promise.reject('The |requestId| ' + request.requestId + ' was used more than once');

      if (request.appId !== Settings.getAppId())
        return Promise.reject('The |appId| does not match the current app id');

      RequestManager.openRequest(request.docId, request.requestId, request);

      // Map built-in pattern name to built-in schema url.
      if (request.pattern == '$ping') {
        return SchemaManager.validate(browser.runtime.getURL('schema/ping.json'),
          { request: request.detail });
      }

      const url = new URL(request.pattern);  // Ensure parsable as URL.
      if (!url.pathname.endsWith('.json'))
        return Promise.reject('Request |pattern| must be a URL that points to a JSON document, and has .json extension.');

      if (!SchemaManager.hasPattern(request.pattern))
        return Promise.reject('No observer for this |pattern|: ' + request.pattern);

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
