# Welcome to Js2at (Javascript to Assistive Technology)

## What is it?

Js2at is an **experimental** system for enabling highly customized [assistive technology](https://en.wikipedia.org/wiki/Assistive_technology) (AT) experiences on the web. It is flexible mechanism enough to enable future experiences not yet conceived of, and structured enough to provide the benefit of standardized protocols. 

Reviews, comments and suggestions are most welcome!
Please read our [guidelines for contributing](CONTRIBUTING.md).

Because Js2at is experimental, we ask that implementers not rely on the specifics of the API, and that the community be patient as we work through any concerns. This is a new concept for the world of accessibility, with the potential to enable extremely rich accessible experiences.

## Use cases

1. Prototype accessibility APIs: explore ideas for new accessibility APIs. The best of these could be upgraded into first-class APIs and integrated into AOM and/or platform accessibility APIs. Therefore, Js2at would allow the community to explore the future of accessibility before committing to new concepts in existing standards.
2. Prototype new roles, e.g. via objects that describe an inheritance hierarchy, supported properties and events. The best of these could be used to inform development of the ARIA standard.
3. Custom user experiences. Enable the development of highly customized, delightful accessible experiences for specialized user content, potentially via AT scripts that understand specific types of Js2at.
4. Virtualized documents: currently, applications which provide a “view” on a data set (such as Google Docs) have no way to provide information to ATs about the non-rendered information. For example, an AT user may ask for a list of headings, but without rendering the entire document (which may be very long) in case this request is made, the developer has no way to provide this information.
5. Better handle specialized content, such as charts, diagrams, maps, and mathematics.

## How does it work?

### Web pages observe community-defined request types

Web pages add observers for the types of structured requests they support. ATs can send structured requests, and asynchronously receive structured responses.

The message pipe only allows requests and responses that conform to agreed-on JSON schemas from the [schema/](schema) folder. Anything that does not conform is rejected by the infrastructure, producing an error. For example, a request-response pattern can be defined by a schema to receive all the data points in a chart. If either the request or response doesn't exactly conform to the schema, the information is not passed. The extension popup provides development settings so that new schemas can be tested.

Further discussion about JSON schemas in Js2at is provided in the [schema/](schema) folder.

### Browser layer acts as traffic cop

Js2at currently requires 4 layers:
1. An assistive technology, which uses a TCP port to connect to a
2. Native message broker, which connects to
3. The Js2at browser infrastructure, which connects to
4. A web page, which creates a Js2atObserver to listen for and respond to Js2atRequest objects

The Js2at infrastructure is currently implemented as a browser extension. In order to make use of it, web pages must currently use the included polyfills under the polyfills/ folder.

Browser support: the message broker is compatible with Chrome and Firefox, but does not yet support Edge.

## Installation

### 1. Install the message broker

The message broker passes messages back and forth between an AT and the browser.

Make sure you have Python 2.x installed, Use <code>pip install zmq</code> to get the required zmq library.

On Windows, run <code>message-broker/install-broker-win.bat</code>
Otherwise, run <code>message-broker/install-broker.sh</code>

In Chrome OS, Js2at bypasses the message broker and communicates directly with each AT.

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

## Debugging tips

- Both the extension and web page will log their messages to their JS consoles.
- The message-broker will log to a file called
message-broker.log in the same directory as the messaging host.
Alternatively, launch chrome from a terminal to view logging output there.
- The example AT logs to stdout.


