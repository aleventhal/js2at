/* eslint parserOptions: ["sourceType", "module"] */
import Js2atUniqueIdManager from './js2at-unique-id-manager.js';
import Js2atRequest from './js2at-request.js';

export default class Js2atObserverDelegate {
  // Promise failure handling

  // Connect to automation server so that we can listen to events
  constructor(requestType, onRequest, onCancel) {
    this.onMessage = (event) => {
      const requestId = event.requestId;
      if (!requestId)
        throw new Error('Request received without request id');
      if (event.cancel) {
        this.complete(requestId, true);
        return;
      }
      if (event.timeout) {
        if (!Number.IsInteger(event.timeout) || event.timeout <= 0)
          throw new Error('Illegal timeout. Must be positive integer (ms).')
        this.timeout = setTimeout(event.timeout, this.cancel);
      }

      const target = Js2atUniqueIdManager.getTarget(event.targetUid);
      if (!target || !this.ports)
        return;
      const js2atHandler = this;
      const js2atRequest = new Js2atRequest({
        type: js2atHandler.type,
        requestId,
        targetUid: event.targetUid,
        detail: event.detail,
        multiSend: event.multiSend,
        sendOneImpl: (detail) => {
          console.assert(event.multiSend);
          if (!js2atHandler.pendingRequests.has(requestId))
            return;

          const port = js2atHandler.ports.get(target);
          if (!port)
            return;

          port.postMessage({
            isComplete: false,
            responseForRequestId: requestId,
            detail
          });
        },
        completeImpl: (detail) => {
          if (js2atHandler.pendingRequests.complete(requestId)) {
            const port = js2atHandler.ports.get(target);
            if (!port)
              return;
            port.postMessage({
              isComplete: true,
              responseForRequestId: requestId,
              detail
            });
          }
        },
        errorImpl: (errorDetail) => {
          if (js2atHandler.complete(this.requestId)) {
            const port = js2atHandler.ports.get(target);
            if (!port)
              return;
            port.postMessage({
              isComplete: true,
              responseForRequestId: requestId,
              detail: errorDetail
            });
          }
        }
      });
      js2atHandler.pendingRequests.set(js2atRequest.requestId, js2atRequest);
    };

    this.requestType = requestType;
    this.onRequest = onRequest;
    this.ports = new WeakMap(); // Map from uuid to port
    // Keep a map of request ids to requests, and hold a strong reference to
    // the requests so that they don't go away before being completed.
    this.pendingRequests = new Map();
  }

  complete(requestId, isCancelled) {
    const request = pendingRequests.get(requestId);
    if (!request)
      return false;
    request.complete = true;
    if (isCancelled && request.onCancel)
      request.onCancel();
    if (request.timeout)
      clearTimeout(request.timeout);
    js2atHandler.pendingRequests.remove(requestId);
    return true;
  }

  observe(eventTarget) {
    if (!this.ports)
      return;

    let port = this.ports.get(eventTarget);
    if (!port) {
      const uuid = Js2atUniqueIdManager.getOrCreateUid(eventTarget);

      port = chrome.runtime.connect( 'hopjidpebkocjhmmhkjmgblipnonklin', {
        name: 'js2at::' + this.requestType + '::' + uuid
      });
      if (chrome.runtime.lastError || !port) {
        console.error(chrome.runtime.lastError || 'No port created');
        return;
      }
      this.ports.set(eventTarget, port);
    }
    port.onMessage.addListener(this.onMessage);
  }

  unobserve(eventTarget) {
    if (!this.ports)
      return;
    const port = this.ports.get(eventTarget);
    port.onMessage.removeListener(this.onMessage);
  }

  disconnect() {  // Ensures full cleanup.
    let iterator = this.ports.keys;
    while (iterator.next()) {
      iterator.value.disconnect();
    }
    delete this.ports;
    delete this.pendingRequests;
  }

  takeRecords() {
    // TODO aren't we always up-to-date in this model?
    this.onRequest([]);
  }
}

