:: Deletes the entries created by install_host_chrome_all_channels.bat
REG DELETE "HKCU\Software\Google\Chrome\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKLM\Software\Google\Chrome\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKCU\Software\Google\Chrome Beta\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKLM\Software\Google\Chrome Beta\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKCU\Software\Google\Chrome Dev\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKLM\Software\Google\Chrome Dev\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKCU\Software\Google\Chrome SxS\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKLM\Software\Google\Chrome SxS\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKCU\Software\Chromium\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKLM\Software\Chromium\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
