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
  settings.apiFilter = settings.apiFilter || 'experimental';

  console.assert(typeof settings.validation === 'undefined' ||
    settings.validation === 'none' ||
    settings.validation === 'log' ||
    settings.validation === 'reject');
  settings.validation = settings.validation || 'reject';
});
