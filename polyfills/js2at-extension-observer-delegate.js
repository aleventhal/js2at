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

/* eslint parserOptions: ["sourceType", "module"] */
import Js2atUniqueIdManager from './js2at-unique-id-manager.js';
import Js2atRequest from './js2at-request.js';
import Js2atMessagePortManager from './js2at-message-port-manager.js';
import Js2atMessagePort from './js2at-message-port.js';

// Observer for one type of js2at message, may be used to listen to the same
// request type on multiple targets.

// TODO support multiple observers each having the same type.

export default class Js2atObserverDelegate {
  // Connect to automation server so that we can listen to events
  constructor(pattern, onRequest, onCancel) {
    this.onMessage = (request) => {
      // Request received from browser extension.
      const requestId = request.requestId;
      if (!requestId)
        throw new Error('Request received without request id');
      if (request.cancel) {
        console.log('Js2at ' + request.pattern + ' request has been cancelled');
        this.complete(requestId, true);
        return;
      }

      const target = Js2atUniqueIdManager.getTarget(request.uid);
      if (!target) {
        console.error('Js2at target not found');
        return;
      }
      if (!this.ports) {
        throw new Error('Js2at disconnected but still receiving messages');
      }
      const js2atHandler = this;
      const js2atRequest = new Js2atRequest({
        pattern: js2atHandler.pattern,
        requestId,
        uid: request.uid,
        detail: request.detail,
        multiSend: request.multiSend,
        sendOneImpl: (detail) => {
          if (!js2atHandler.pendingRequests.has(requestId))
            return;

          const port = js2atHandler.ports.get(target);
          if (!port)
            return;

          port.postMessage({
            responseForRequestId: requestId,
            isComplete: false,
            detail
          });
        },
        completeImpl: (detail, isTimeout) => {
          if (this.timeoutId) {
            clearTimeout(this.timeoutId)
            delete this.timeoutId;
          }
          if (js2atHandler.complete(requestId, isTimeout, isTimeout)) {
            const port = js2atHandler.ports.get(target);
            if (!port)
              return;
            port.postMessage({
              responseForRequestId: requestId,
              isComplete: true,
              detail
            });
          }
        }
      });
      if (request.timeout) {
        if (!Number.isInteger(request.timeout) || request.timeout <= 0)
          console.error('Illegal timeout. Must be positive integer (ms).')
        js2atRequest.timeoutId = setTimeout(
          () => {
            js2atRequest.completeImpl({ error: 'Timeout error' }, true);
          },
          request.timeout
        );
      }

      js2atHandler.pendingRequests.set(js2atRequest.requestId, js2atRequest);
      this.onRequest(js2atRequest);
    };

    this.pattern = pattern.toString();  // Ensure serializable (in case URL).
    this.onRequest = onRequest;
    this.onCancel = onCancel;
    this.ports = new WeakMap(); // Map from event target to port
    // Keep a map of request ids to requests, and hold a strong reference to
    // the requests so that they don't go away before being completed.
    this.pendingRequests = new Map();
  }

  complete(requestId, isCancelled, isCancelledFromTimeout) {
    if (!this.ports)
      throw new Error('Js2at observer disconnected.')
    const request = this.pendingRequests.get(requestId);
    if (!request)
      return false;
    request.isComplete = true;
    if (isCancelled && this.onCancel) {
      this.onCancel(requestId, Boolean(isCancelledFromTimeout));
    }
    this.pendingRequests.delete(requestId);
    return true;
  }

  observe(eventTarget) {
    if (!this.ports)
      throw new Error('Js2at observer disconnected.')

    const uid = Js2atUniqueIdManager.getOrCreateUid(eventTarget, this.unobserve);
    const onPortDisconnected = (port) => {
      // Port disconnected by extension.
      if (this.pendingRequests) {
        // For any pending requests with the same uid, respond with error.
        for (request of this.pendingRequests) {
          if (request.uid === port.uid)
            request.error({ error: 'Js2at observer disconnected'});
        }
      }
      this.ports.delete(Js2atUniqueIdManager.getTarget(port.uid));
    };
    // This will not allow multiple observers for the same type x uid combo.
    const port = new Js2atMessagePort(this.pattern, uid, this.onMessage,
      onPortDisconnected);
    this.ports.set(eventTarget, port);
  }

  unobserve(eventTarget) {
    if (!this.ports)
      throw new Error('Js2at observer disconnected.')
    const port = this.ports.get(eventTarget);
    console.assert(port, 'No js2at observer to remove.');
    port.disconnect();
  }

  disconnect() {  // Ensures full cleanup.
    if (!this.ports)
      throw new Error('Js2at observer already disconnected.')
    this.ports.forEach((port) => {
      port.disconnect();
    });
    delete this.pendingRequests;
    delete this.ports;
  }
}

