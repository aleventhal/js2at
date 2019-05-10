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
