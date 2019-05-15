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
import Js2atObserverDelegate from '../polyfills/js2at-extension-observer-delegate.js';

// The callback will receive an array of Js2atRequest objects.
export default class Js2atObserver {
  constructor(pattern, onRequest, onCancel) {
    if (pattern instanceof URL === false)
      throw new Error('A Js2at pattern of type URL must be supplied.');
    this.pattern = pattern;

    if (typeof onRequest !== 'function')
      throw new Error('An onRequest callback must be supplied that takes a Js2atRequest object.');

    if (typeof onCancel !== 'undefined' && typeof onCancel !== 'function')
      throw new Error('If an onCancel callback is supplied, it must be a function that takes a Js2atRequest object.');

    this.onRequest = onRequest;

    this.onCancel = onCancel;

    const delegate = new Js2atObserverDelegate(pattern, onRequest, onCancel);
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
