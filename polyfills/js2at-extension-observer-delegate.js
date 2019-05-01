/* eslint parserOptions: ["sourceType", "module"] */
import Js2atUniqueIdManager from './js2at-unique-id-manager.js';
import Js2atRequest from './js2at-request.js';
import Js2atMessagePort from './js2at-message-port.js';

// Observer for one type of js2at message, may be used to listen to the same
// request type on multiple targets.

// TODO support multiple observers each having the same type.

export default class Js2atObserverDelegate {
  // Promise failure handling

  // Connect to automation server so that we can listen to events
  constructor(requestType, onRequest, onCancel) {
    this.onMessage = (request) => {
      // Request received from browser extension.
      const requestId = request.requestId;
      if (!requestId)
        throw new Error('Request received without request id');
      if (request.cancel) {
        console.log('Js2at ' + request.type + ' request has been cancelled');
        this.complete(requestId, true);
        return;
      }
      if (request.timeout) {
        if (!Number.isInteger(request.timeout) || request.timeout <= 0)
          throw new Error('Illegal timeout. Must be positive integer (ms).')
        this.timeout = setTimeout(
          () => {
            this.complete(requestId, true, true);
          },
          request.timeout
        );
      }

      const target = Js2atUniqueIdManager.getTarget(request.targetUid);
      if (!target) {
        console.error('Js2at target not found');
        return;
      }
      if (!this.ports) {
        throw new Error('Js2at disconnected but still receiving messages');
      }
      const js2atHandler = this;
      const js2atRequest = new Js2atRequest({
        type: js2atHandler.type,
        requestId,
        targetUid: request.targetUid,
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
        completeImpl: (detail) => {
          if (js2atHandler.complete(requestId)) {
            const port = js2atHandler.ports.get(target);
            if (!port)
              return;
            port.postMessage({
              responseForRequestId: requestId,
              isComplete: true,
              detail
            });
          }
        },
        errorImpl: (errorDetail) => {
          if (js2atHandler.complete(requestId)) {
            const port = js2atHandler.ports.get(target);
            if (!port)
              return;
            port.postMessage({
              responseForRequestId: requestId,
              isComplete: true,
              detail: errorDetail
            });
          }
        }
      });
      js2atHandler.pendingRequests.set(js2atRequest.requestId, js2atRequest);
      this.onRequest(js2atRequest);
    };

    console.assert(requestType instanceof URL);
    this.type = requestType.toString();  // Convert URL to serializable string.
    this.onRequest = onRequest;
    this.onCancel = onCancel;
    this.ports = new WeakMap(); // Map from event target to port
    // Keep a map of request ids to requests, and hold a strong reference to
    // the requests so that they don't go away before being completed.
    this.pendingRequests = new Map();
  }

  complete(requestId, isCancelled, isCancelledFromTimeout) {
    const request = this.pendingRequests.get(requestId);
    if (!request)
      return false;
    request.isComplete = true;
    if (isCancelled && this.onCancel) {
      this.onCancel(requestId, Boolean(isCancelledFromTimeout));
    }
    if (request.timeout)
      clearTimeout(request.timeout);
    this.pendingRequests.delete(requestId);
    return true;
  }

  observe(eventTarget) {
    if (!this.ports)
      return;

    let port = this.ports.get(eventTarget);
    if (!port) {
      const uid = Js2atUniqueIdManager.getOrCreateUid(eventTarget);
      const onPortDisconnected = (port) => {
        // Port disconnected by extension.
        const targetUid = port.uid;
        this.ports.delete(Js2atUniqueIdManager.getTarget(targetUid));
      };
      port = new Js2atMessagePort(this.type, uid, onPortDisconnected);
      this.ports.set(eventTarget, port);
    }
    port.addListener(this.onMessage);
  }

  unobserve(eventTarget) {
    if (!this.ports)
      return;
    const port = this.ports.get(eventTarget);
    port.removeListener(this.onMessage);
  }

  disconnect() {  // Ensures full cleanup.
    let iterator = this.ports.keys;
    while (iterator.next()) {
      iterator.value.disconnect();
    }
    delete this.ports;
    delete this.pendingRequests;
  }
}

