
function selectOptionIfAvailable(htmlOption) {
  if (htmlOption)
    htmlOption.selected = true;
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.getBackgroundPage((bgPage) => {
    const settings = bgPage.getSettings();

    // Api filter combobox.
    const apiFilterCombo = document.getElementById('apiFilter');
    apiFilterCombo.addEventListener('change', onApiFilterSettingChange);
    function onApiFilterSettingChange() {
      settings.setApiFilter(apiFilterCombo.value);
    }
    selectOptionIfAvailable(apiFilterCombo.namedItem(settings.getApiFilter()));

    // Validation combobox.
    const validationCombo = document.getElementById('validation');
    validationCombo.addEventListener('change', onValidationSettingChange);
    function onValidationSettingChange() {
      settings.setValidation(validationCombo.value);
    }
    selectOptionIfAvailable(validationCombo.namedItem(settings.getValidation()));

    // Local schemas checkbox.
    const useLocalSchemasCheckbox = document.getElementById('useLocalSchemas');
    useLocalSchemasCheckbox.addEventListener('change', onUseLocalSchemasSettingChange);
    function onUseLocalSchemasSettingChange() {
      settings.setUseLocalSchemas(useLocalSchemasCheckbox.checked);
    }
    useLocalSchemasCheckbox.checked = settings.getUseLocalSchemas();
  });
});

