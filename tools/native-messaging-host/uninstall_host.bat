:: Deletes the entry created by install_host.bat
REG DELETE "HKCU\Software\Google\Chrome\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
REG DELETE "HKLM\Software\Google\Chrome\NativeMessagingHosts\org.js2at.chrome_native_messaging_host" /f
