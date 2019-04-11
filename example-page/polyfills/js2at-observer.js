/* eslint parserOptions: ["sourceType", "module"] */

import Js2atUniqueIdManager from './js2at-unique-id-manager.js';

// The callback will receive an array of Js2atRequest objects.
export default class Js2atObserver {
  constructor(type, onRequest, onCancel) {
    if (type instanceof URL === false)
      throw new Error('A Js2at requestType of type URL must be supplied.');
    this.type = type;

    if (typeof onRequest !== 'function')
      throw new Error('An onRequest callback must be supplied that takes a Js2atRequest object.');

    if (typeof onCancel !== 'undefined' && typeof onCancel !== 'function')
      throw new Error('If an onCancel callback is supplied, it must be a function that takes a Js2atRequest object.');

    this.onRequest = onRequest;

    this.onCancel = onCancel;

    const delegate = this.createDelegate(this.type, onRequest, onCancel);
    this.observe = (eventTarget) => {
      delegate.observe(eventTarget);
    };

    this.unobserve = (eventTarget) => {
      delegate.unobserve(eventTarget);
    };

    this.disconnect = () => {
      delegate.disconnect();
    };

    this.takeRecords = (callback) => {
      // Not very useful at the moment. Should we keep?
      callback([]);
    }
  }
}


