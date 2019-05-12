:: Change HKLM to HKLM if you want to install globally.
:: %~dp0 is the directory containing this bat script and ends with a backslash.
:: Install for all channels of Chrome or Chromium.
REG ADD "HKLM\Software\Google\Chrome\NativeMessagingHosts\org.js2at.message_broker" /ve /t REG_SZ /d "%~dp0org.js2at.message_broker-win.json" /f
REG ADD "HKLM\Software\Google\Chrome Beta\NativeMessagingHosts\org.js2at.message_broker" /ve /t REG_SZ /d "%~dp0org.js2at.message_broker-win.json" /f
REG ADD "HKLM\Software\Google\Chrome Dev\NativeMessagingHosts\org.js2at.message_broker" /ve /t REG_SZ /d "%~dp0org.js2at.message_broker-win.json" /f
REG ADD "HKLM\Software\Google\Chrome SxS\NativeMessagingHosts\org.js2at.message_broker" /ve /t REG_SZ /d "%~dp0org.js2at.message_broker-win.json" /f
REG ADD "HKLM\Software\Chromium\NativeMessagingHosts\org.js2at.message_broker" /ve /t REG_SZ /d "%~dp0org.js2at.message_broker-win.json" /f
REG ADD "HKLM\Software\Mozilla\NativeMessagingHosts\org.js2at.message_broker"  /ve /t REG_SZ /d "%~dp0org.js2at.message_broker-win.json" /f
