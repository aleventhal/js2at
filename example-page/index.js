'use strict';

(function initPolyfillIfNecessary() {
  if (window.hasOwnProperty('Js2atObserver')) {
    document.getElementById('demo-type-loaded').innerText = ' (built-in browser support)';
    initDemoVia(''); // Use browser implementatin.
  } else if (document.location.search == '?polyfill=input') {
    document.getElementById('demo-type-loaded').innerText = ' (input polyfill loaded)';
    initDemoVia('polyfills/js2at-polyfill-via-inputs.js');
  } else if (document.location.search == '?polyfill=extension') {
    document.getElementById('demo-type-loaded').innerText = ' (extension polyfill loaded)';
    initDemoVia('polyfills/js2at-polyfill-via-extension.js');
  }
  function insertScript(name) {
    if (name) {
      const polyFillScriptElem = document.createElement('script');
      polyFillScriptElem.src = name;
      polyFillScriptElem.type = 'module';
      document.querySelector('head').appendChild(polyFillScriptElem);
    }

    const demoScriptElem = document.createElement('script');
    demoScriptElem.src = './demo.js';
    document.querySelector('head').appendChild(demoScriptElem);
  }
})();

console.log(Js2atUniqueIdManager);

