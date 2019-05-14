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
// Similate an individual message port, implemented with a single MessageChannel
// that is opened by the Extension.

import Js2atMessagePortManager from './js2at-message-port-manager.js';

export default class Js2atMessagePort {
  constructor(pattern, uid, onRequestCallback, onDisconnectCallback) {
    this.pattern = pattern;
    this.uid = uid;
    this.onRequest = onRequestCallback;
    this.onDisconnect = () => {
      onDisconnectCallback(this);
      Js2atMessagePortManager.sendMessageToExtension({
        "$command": "observerRemoved",
        pattern,
        uid
      });
    }
    Js2atMessagePortManager.setPort(pattern, uid, this);
    Js2atMessagePortManager.sendMessageToExtension({
      "$command": "observerAdded",
      pattern,
      uid
    });
  }

  disconnect() {
    Js2atMessagePortManager.removePort(this.pattern, this.uid);
    this.onDisconnect();
  }

  postMessage(data) {
    console.assert(data.responseForRequestId);
    console.assert(data.isComplete);
    console.assert(data.detail);
    Js2atMessagePortManager.sendMessageToExtension(data);
  }
}

