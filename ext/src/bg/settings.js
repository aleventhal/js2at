class Settings {
  constructor() {
    chrome.storage.sync.get(['apiFilter', 'validation'], (storedSettings) => {
      this.apiFilter = storedSettings.apiFilter;
      this.validation = storedSettings.validation;

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
    });
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
}

export default new Settings();
