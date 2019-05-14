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

// Polyfill cross-browser web extension api, which uses top level browser
// object along with promises instead of callbacks.
// The extension  don't actually use the promise or callback feature of any of the
// APIs, so for now now just assign browser = chrome
// import browser from './third_party/ajv/browser-polyfill.js';
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

