/* eslint parserOptions: ["sourceType", "module"] */

// This class is used by the Js2AtObserver polyfill to communicate with the
// Js2at helper extension, which uses the native messaging API to communicate
// with the AT.

import Js2atObserverDelegate from './polyfills/js2at-extension-observer-delegate.js';
import Js2atObserver from './polyfills/js2at-observer.js';

// This allows us to create the demo based on different implementations, e.g.
// via extension/input polyfill or via built-in browser support.
Js2atObserver.prototype.createDelegate = function(...args) {
  return new Js2atObserverDelegate(...args);
};

import js2atDemo from './demo.js';
js2atDemo(Js2atObserver);
