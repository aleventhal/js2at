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

// Transfer messages between page and background script.
// For page communication, listents on a single message channel that is used for
// all messages in this window.
// For extension communication, opens up a port for extension api.
// Advantages over direct communication between page and background script:
// - Can work in Firefox
// - No need for "externally-connectable" domain whitelist in manifest.json,
//   where every site using js2at would need to be explicitly listed.

addEventListener('message', receivePort);

if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype)
  browser = chrome;  // Don't need full webextension-polyfill for this simple page.

function receivePort(event) {
  if (event.data !== 'js2atChannelInit')
    return;
  console.assert(!receivePort.pageScriptPort);  // Make sure we don't try to set the port twice.

  const kSelfExtensionId = browser.runtime.id;
  const backgroundScriptPort = browser.runtime.connect(kSelfExtensionId, {
    name: 'js2at',  // Could pass info through this way.
    // includeTlsChannelId: false  // TODO better understand this
  });
  if (browser.runtime.lastError) {
    console.error(browser.runtime.lastError);
  }
  if (backgroundScriptPort) {
    removeEventListener('message', receivePort);
    receivePort.pageScriptPort = event.ports[0];
    receivePort.pageScriptPort.onmessage = (event) => {
      console.log('Content script sending to bg script', event.data);
      backgroundScriptPort.postMessage(event.data);  // Transfer to background script.
    }

    backgroundScriptPort.onMessage.addListener((data) => {
      if (data['$command']) {
        if (data['$command'] === 'initIds') {
          // Temporary hack so that the AT can discover the app and frameId and know
          // where to send information.
          document.documentElement.id = 'js2at:' + data.appId + ':' + data.docId;
        }
        return;
      }
      console.log('Content script sending to page', data)
      receivePort.pageScriptPort.postMessage(data);  // Unused params: sender, sendResponseCallback.
    });
  }
}
