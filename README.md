# Welcome to Js2at

## Requirements

Js2at currently requires 4 things:
- An assistive technology, which connects to
- Native messaging host, which connects to
- An extension that supports the polyfill library, which connects to
- A web page that uses it via a polyfill library

## Installation

1. Install the native messaging host

On Windows, run tools/native-messaging-host/install-host-win.bat
Otherwise, run tools/native-messaging-host/install-host.sh

The native messaging host installer does not yet support Firefox.

2. Install the extension

The extension is under ext, and can be loaded as an unpacked extension under
chrome://extensions.

It is not yet compatible with Firefox, and Edge needs to be tested.

## Running the examples

In either order:
- Run example-at/example-at.py
- Load the web page at [example-page/index.html sample web page] is located
in the example-page directory. You can't run it off the file system, because
Chrome won't allow file:// urls to communicate with an extension, so run a
local server such as
via python -m SimpleHTTPServer and then load it from localhost.

You do not have to run the native messaging host, the browser launches it.

## Debugging

- Both the extension and web page will log their messages to the console.
- The native messaging host will log to a file called
js2at-native-messaging-host.log in the same directory as the messaging host.
- The example AT logs to stdout.

## The other polyfill

The hidden input polyfill is currently broken.

This is an older polyfill that uses hidden inputs instead of an extension is provided,
but the code has not been converted over
to using the Js2atObserver/Js2atRequest model. The hidden input polyfill
uses invisible input fields to communicate with the AT.

There is also a C++ client under tools was used for the hidden input polyfill.

