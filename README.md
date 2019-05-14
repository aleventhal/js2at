# Welcome to Js2at (Javascript to Assistive Technology)

## What is it?

Js2at is an experimental system for enabling highly customized assistive technology (AT) experiences for specialized types of content, where existing approaches are insufficient. It is a general mechanism that is flexible enough to enable future experiences not yet conceived of. Web pages add observers for the types of structured requests they support. ATs can send structured requests, and asynchronously receive structured responses.

While messaging passing has been generalized, the message pipe only allows requests and responses that conform to standard JSON schemas agreed on by the community. Anything that does not conform is rejected by the infrastructure, producing an error. For example, a request-response pattern can be defined by a schema to receive all the data points in a chart. If either the request or response doesn't exactly conform to the schema, the information is not passed. The extension popup provides development settings so that new schemas can be tested.

Further discussion about JSON schemas in Js2at is provided under [schema/README.md](schema/README.md).

## Call for contributions and feedback

Everything in this project should be considered an experiment.

Reviews, comments and suggestions are most welcome!
Please read our [guidelines for contributing](CONTRIBUTING.md).


## Requirements

Js2at currently requires 4 layers:
- An assistive technology, which uses a TCP port to connect to a
- Native message broker, which connects to
- The Js2at browser infrastructure, which connects to
- A web page, which creates a Js2atObserver to listen for and respond to Js2atRequest objects

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


