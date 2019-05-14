# Welcome to Js2at (Javascript to Assistive Technology)

## What is it?

Js2at is a system for enabling customized web application accessibility in existing assistive technologies. It is flexible enough to enable future experiences not yet conceived of. Web pages add observers for the types of structured requests they support. ATs can send conforming structured requests, and asynchronously receive structured responses.

Requests and responses in Js2at must conform to a community or standard JSON schema published on the web, or they are rejected by the infrastructure. JSON schema is an IETF draft standard. For more information on JSON schema, see https://json-schema.org/specification.html.

Schema examples are provided in the schema/ directory. The process for developing or changing a request/response schema currently involves submitting a PR to the contents of that directory.

## Requirements

Js2at currently requires 4 things:
- An assistive technology, which uses TCP to connect to a
- Native message broker, which connects to
- The Js2at browser infrastructure, which connects to
- A web page, which uses Js2atObserver to listen for and respond to Js2atRequest objects

The Js2at infrastructure is currently implemented as a browser extension. In order to make use of it, web pages must currently use the included polyfills under the polyfills/ folder.

## Installation

### 1. Install the message broker

The message broker passes messages back and forth between an AT and the browser.

Make sure you have Python 2.x installed, Use <code>pip install zmq</code> to get the required zmq library.

On Windows, run message-broker/install-broker-win.bat
Otherwise, run message-broker/install-broker.sh

Notes:
- Browser support: the message broker is compatible with Chrome and Firefox, but does not yet support Edge.
- Chrome OS: Js2at bypasses the message broker and communicates directly with each AT.

### 2. Install the extension

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


