:: Change HKCU to HKLM if you want to install globally.
:: %~dp0 is the directory containing this bat script and ends with a backslash.
:: Install for all channels of Chrome or Chromium.
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /ve /t REG_SZ /d "%~dp0org.js2at.chrome_native_messaging_host-win.json" /f
REG ADD "HKCU\Software\Google\Chrome Beta\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /ve /t REG_SZ /d "%~dp0org.js2at.chrome_native_messaging_host-win.json" /f
REG ADD "HKCU\Software\Google\Chrome Dev\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /ve /t REG_SZ /d "%~dp0org.js2at.chrome_native_messaging_host-win.json" /f
REG ADD "HKCU\Software\Google\Chrome SxS\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /ve /t REG_SZ /d "%~dp0org.js2at.chrome_native_messaging_host-win.json" /f
REG ADD "HKCU\Software\Chromium\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /ve /t REG_SZ /d "%~dp0org.js2at.chrome_native_messaging_host-win.json" /f
