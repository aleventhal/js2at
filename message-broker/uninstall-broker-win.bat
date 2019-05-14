rem  Copyright 2019 Google LLC
rem
rem  Licensed under the Apache License, Version 2.0 (the "License");
rem  you may not use this file except in compliance with the License.
rem  You may obtain a copy of the License at
rem
rem       http://www.apache.org/licenses/LICENSE-2.0
rem
rem  Unless required by applicable law or agreed to in writing, software
rem  distributed under the License is distributed on an "AS IS" BASIS,
rem  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
rem  See the License for the specific language governing permissions and
rem  limitations under the License.

:: Deletes the entries created by install_broker.bat
REG DELETE "HKCU\Software\Google\Chrome\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKLM\Software\Google\Chrome\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKCU\Software\Google\Chrome Beta\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKLM\Software\Google\Chrome Beta\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKCU\Software\Google\Chrome Dev\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKLM\Software\Google\Chrome Dev\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKCU\Software\Google\Chrome SxS\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKLM\Software\Google\Chrome SxS\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKCU\Software\Chromium\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKLM\Software\Chromium\NativeMessagingHosts\org.js2at.message_host" /f
REG DELETE "HKCU\Software\Mozilla\NativeMessagingHosts\org.js2at.message_broker" /f
REG DELETE "HKLM\Software\Mozilla\NativeMessagingHosts\org.js2at.message_broker" /f
