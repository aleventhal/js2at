# Welcome to Js2at

## Getting Started

Js2at currently requires 3 things, the native messaging host, an extension that
supports the polyfill, and a web page that uses it.

1. Installing the native messaging host

On Windows, run tools/native-messaging-host/install-host-win.bat
Otherwise, run tools/native-messaging-host/install-host.sh

2. Installing the extension

The extension is under ext. Right now it just dumps to the background console.

3. Loading the web page

A [example-page/index.html sample web page] is located in the example-page
directory. You can't run it off the file system, because Chrome won't allow
file:// urls to communicate with an extension, so run a local server such as
via python -m SimpleHTTPServer and then load it from localhost.

When you load the web page you should see some logging in the extension's
background page console that shows messages are being passed.

## Hidden input polyfill is currently broken

The hidden input polyfill code is provided, but has not been converted over
to using the Js2atObserver/Js2atRequest model. The hidden input polyfill
uses invisible input fields to communicate with the AT.

There is also a C++ client under tools was used for the hidden input polyfill.

