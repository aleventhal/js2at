/* eslint parserOptions: ["sourceType", "module"] */

// This class is used by the Js2AtObserver polyfill to communicate directly with
// the AT via two hidden inputs (one in and one out).

import Js2atUniqueIdManager from './polyfills/js2at-unique-id-manager.js';
import Js2atRequest from './polyfills/js2at-request.js';
import Js2atObserverDelegate from './polyfills/js2at-observer-delegate-via-input.js';
import Js2atObserver from './polyfills/js2at-observer.js';

// This allows us to create the demo based on different implementations, e.g.
// via extension/input polyfill or via built-in browser support.
Js2atObserver.prototype.createDelegate = function(...args) {
  return new Js2atObserverDelegate(...args);
};

import js2atDemo from './demo.js';
js2atDemo(Js2atUniqueIdManager, Js2atRequest, Js2atObserver);
