/**
 * 1. Send and receive messages from the web page
 * 2. Send and receive messages from native messaging broker
 *    (uses native-messaging.js to do the actual work)
 */

// TODO what happens if AT launches after page?
// TODO one port per tab.

let settings = {};
let openRequests = {}; // Track open requests and the requestType for them.

function getSettings() {
  return settings;
}

function setApiFilter(apiFilter) {
  chrome.storage.sync.set({ apiFilter });
  settings.apiFilter =apiFilter;
}

function setValidation(validation) {
  chrome.storage.sync.set({ validation });
  settings.validation = validation;
}

chrome.storage.sync.get(['apiFilter', 'validation'], (storedSettings) => {
  settings = storedSettings;  // Just use. Don't resave back to storage.

  // TODO Make code DRY. These allowed values are repeated in popup.html.
  console.assert(typeof settings.apiFilter === 'undefined' ||
    settings.apiFilter === 'strict' ||
    settings.apiFilter === 'community' ||
    settings.apiFilter === 'experimental');
  settings.apiFilter = settings.apiFilter || 'community';

  console.assert(typeof settings.validation === 'undefined' ||
    settings.validation === 'none' ||
    settings.validation === 'log' ||
    settings.validation === 'reject');
  settings.validation = settings.validation || 'reject';
});

// A port is connected, indicatingthat an object on the page is listening to
// js2at requests.
chrome.runtime.onConnect.addListener(onPagePortConnect);


