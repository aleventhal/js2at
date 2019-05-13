# Welcome to Js2at

## Requirements

Js2at currently requires 4 things:
- An assistive technology, which connects to
- Native messaging broker, which connects to
- An extension that supports the polyfill library, which connects to
- A web page that uses it via a polyfill library

## Installation

1. Install the message broker

The message broker passes messages back and forth between an AT and the browser.

Make sure you have Python 2.x installed and use <ode>pip install zmq</code> to get the required Zmq library.

On Windows, run message-broker/install-broker-win.bat
Otherwise, run message-broker/install-broker.sh

The message broker installer works in Firefox, but does not yet support Edge.

It is not necessary or useful on Chrome OS, which will need a different
mechanism for communicating with ATs, since they are non-native and
essentially browser extensions.

2. Install the extension

The extension is under ext, and can be loaded as an unpacked extension under
chrome://extensions.

The extension is compatible with Firefox, but Microsoft Edge needs to be tested.

## Running the examples

In either order:
- Run example-at/example-at.py
- Load the web page at [example-page/index.html sample web page] is located
in the example-page directory. You can't run it off the file system, because
Chrome won't allow file:// urls to communicate with an extension, so run a
local server such as
via python -m SimpleHTTPServer and then load it from localhost.

You do not have to run the message broker, the browser launches it.

## Debugging

- Both the extension and web page will log their messages to their JS consoles.
- The message-broker will log to a file called
message-broker.log in the same directory as the messaging host.
Alternatively, launch chrome from a terminal to view logging output there.
- The example AT logs to stdout.


