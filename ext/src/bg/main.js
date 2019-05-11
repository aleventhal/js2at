// Polyfill cross-browser web extension api, which uses top level browser
// object along with promises instead of callbacks.
// The extension  don't actually use the promise or callback feature of any of the
// APIs, so for now now just assign browser = chrome
// import browser from './lib/browser-polyfill.js';
// window.browser = browser
window.browser = chrome;

// Expose settings to popup script.
import Settings from './settings.js';
window.getSettings = function() {
  return Settings;
}

// Listen for and respond to messages from page.
import PageMessaging from './page-messaging.js';
PageMessaging.begin();

