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

class Settings {
  constructor() {
    chrome.storage.sync.get(['apiFilter', 'validation', 'useLocalSchemas'], (storedSettings) => {
      this.apiFilter = storedSettings.apiFilter;
      this.validation = storedSettings.validation;
      this.useLocalSchemas = storedSettings.useLocalSchemas;

      // TODO Make code DRY. These allowed values are repeated in popup.html.
      console.assert(typeof this.apiFilter === 'undefined' ||
        this.apiFilter === 'strict' ||
        this.apiFilter === 'community' ||
        this.apiFilter === 'experimental');
      this.apiFilter = this.apiFilter || 'experimental';

      console.assert(typeof this.validation === 'undefined' ||
        this.validation === 'none' ||
        this.validation === 'log' ||
        this.validation === 'reject');
      this.validation = this.validation || 'reject';

      console.assert(typeof this.useLocalSchemas === 'undefined' ||
        typeof this.useLocalSchemas === 'boolean');
      this.useLocalSchemas = this.useLocalSchemas || false;
    });

    // Use consistent appId for this browser on this computer, even if extension
    // refreshes. Not required, but makes manual testing with copy/paste easier.
    chrome.storage.local.get(['appId'], ({appId}) => {
      if (appId) {
        this.appId = appId;
      }
      else {
        this.appId = Math.random().toString(26).substr(2);
        chrome.storage.local.set({ appId: this.appId });
      }
    });
  }

  getAppId() {
    return this.appId;
  }

  getApiFilter() {
    return this.apiFilter;
  }

  setApiFilter(apiFilter) {
    chrome.storage.sync.set({ apiFilter });
    this.apiFilter =apiFilter;
  }

  getValidation() {
    return this.validation;
  }

  setValidation(validation) {
    chrome.storage.sync.set({ validation });
    this.validation = validation;
  }

  getUseLocalSchemas() {
    return this.useLocalSchemas;
  }

  setUseLocalSchemas(useLocalSchemas) {
    chrome.storage.sync.set({ useLocalSchemas });
    this.useLocalSchemas = useLocalSchemas;
  }
}

export default new Settings();
