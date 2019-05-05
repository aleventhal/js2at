
function selectOptionIfAvailable(htmlOption) {
  if (htmlOption)
    htmlOption.selected = true;
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.getBackgroundPage((bgPage) => {
    const apiFilterCombo = document.getElementById('apiFilter');
    apiFilterCombo.addEventListener('change', onApiFilterSettingChange);
    function onApiFilterSettingChange(event) {
      bgPage.setApiFilter(apiFilterCombo.value);
    }
    const validationCombo = document.getElementById('validation');
    validationCombo.addEventListener('change', onValidationSettingChange);
    function onValidationSettingChange(event) {
      bgPage.setValidation(validationCombo.value);
    }

    const settings = bgPage.getSettings();
    selectOptionIfAvailable(apiFilterCombo.namedItem(settings.apiFilter));
    selectOptionIfAvailable(validationCombo.namedItem(settings.validation));
  });
});

