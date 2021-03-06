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

import AtMessaging from './at-messaging.js';
import SchemaManager from './schema-manager.js';
import RequestManager from './request-manager.js';
import Settings from './settings.js';

class PageMessaging {
  constructor() {
    this.pagePorts = {};  // Indexed by docId.
  }

  begin() {
    browser.runtime.onConnect.addListener((port) => this.onPagePortConnect(port));
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
    if (!AtMessaging.ensureAtConnection())
      return;
    // Add automatically populated fields.
    message.appId = Settings.getAppId();
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

  async processInternalPageCommand(message) {
    const internalCommand = message['$command'];
    // A $command is something internal, sent by js2at infrastructure.
    try {
      if (internalCommand === 'observerAdded') {
        await SchemaManager.validate(browser.runtime.getURL('schema/observerChange.json'), message)
        await SchemaManager.preparePattern(message.pattern);
        AtMessaging.sendMessage(message);
      }
      else if (internalCommand == 'observerRemoved') {
        await SchemaManager.validate(browser.runtime.getURL('schema/observerChange.json'), message)
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
      }
      else
        return Promise.reject('Unsupported internal command: ' + internalCommand);
    }
    catch(err) {
      AtMessaging.sendGeneratedErrorResponse(err, message.docId, message.responseForRequestId );
    }
  }

  async sendPageResponseOrError(response) {
    try {
      const request = RequestManager.getRequest(response.docId, response.responseForRequestId);
      if (!request)
        return Promise.reject('Could not find corresponding open request for this |responseForRequestId| and |docId|');

      // Generic response container validation.
      // TODO should we have option for this?
      // It's a possible optimization since infrastructure builds this structure and it should be valid.
      await SchemaManager.validate(browser.runtime.getURL('schema/response.json'), response);

      // Validate |detail| object according to pattern, unless response is an error,
      if (response.detail.error) {
        // Error detail is not currently validated, just returned.
        // TODO Build internal schema for detail: { error } case.
        console.assert(response.isComplete === true);
      }
      else {
        const schemaUrl = request.pattern === '$ping' ?
          browser.runtime.getURL('schema/ping.json') :
          request.pattern;
        await SchemaManager.validate(schemaUrl, { response: response.detail });
      }

      AtMessaging.sendMessage(response);
    }
    catch(err) {
      AtMessaging.sendGeneratedErrorResponse(err, response.docId, response.responseForRequestId );
    }
  }

  onPagePortConnect(port) {
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
      delete this.pagePorts[docId];
    });

    // After port connects, send it an initial help message with ids.
    port.postMessage({
      '$command': 'initIds',
      appId: Settings.getAppId(),
      docId
    });
  }
}

export default new PageMessaging();
