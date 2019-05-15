# Welcome to Js2at (Javascript to Assistive Technology)

## What is it?

Js2at is an **experimental** system for enabling highly customized [assistive technology](https://en.wikipedia.org/wiki/Assistive_technology) (AT) experiences on the web. It is flexible mechanism enough to enable future experiences not yet conceived of, and structured enough to provide the benefit of standardized protocols. 

Reviews, comments and suggestions are most welcome!
Please read our [guidelines for contributing](CONTRIBUTING.md).

Because Js2at is experimental, we ask that implementers not rely heavily on the current specifics of the API, and that the community be patient as we work through any concerns. This is a new concept for the world of accessibility, with the potential to enable extremely rich accessible experiences.

## Use cases

Overall, Js2at can be used to prototype new accessible experiences, APIs and semantics.

### Protoyping accessibility standrds

1. Prototype accessibility APIs: explore ideas for new accessibility APIs. The best of these could be upgraded into first-class APIs and integrated into AOM and/or platform accessibility APIs. Therefore, Js2at would allow the community to explore the future of accessibility before committing to new concepts in existing standards.
2. Prototype new roles, e.g. via objects that describe an inheritance hierarchy, supported properties and events. The best of these could be used to inform development of the ARIA standard.

### Prototyping user experiences

3. Custom user experiences. Enable the development of highly customized, delightful accessible experiences for specialized user content, potentially via AT scripts that understand specific types of Js2at.
4. Virtualized documents: currently, applications which provide a “view” on a data set (such as Google Docs) have no way to provide information to ATs about the non-rendered information. For example, an AT user may ask for a list of headings, but without rendering the entire document (which may be very long) in case this request is made, the developer has no way to provide this information.
5. Better handle specialized content, such as charts, diagrams, maps, and mathematics.

## How does it work?

### Web pages observe community-defined request types

Web pages add observers for the types of structured requests they support. ATs can send structured requests, and asynchronously receive structured responses.

The message pipe only allows requests and responses that conform to agreed-on JSON schemas from the [schema/](schema) folder. Anything that does not conform is rejected by the infrastructure, producing an error. For example, a request-response pattern can be defined by a schema to receive all the data points in a chart. If either the request or response doesn't exactly conform to the schema, the information is not passed. The extension popup provides development settings so that new schemas can be tested.

### Js2at browser layer acts as traffic cop between the AT and content

Js2at involves three layers:
1. **Assistive technology** uses a TCP port to connect to Js2at and send requests. See provided AT examples in the [example-at/](example-at) folder.
2. **Js2at "traffic cop" layer**
   - Ensure incoming AT requests and and outgoing content responses conform to schemas. If not, sends error message to AT. Schema authoring guidance and examples are provided in the [schema/](schema) folder.
   - The schema must be agreed on by the content and AT developers.
   - Route conforming AT request to appropriate Js2atObserver in content
   - Route conforming content responses to AT that originated the request
3. **Web content**, which creates a Js2atObserver to listen for and respond to Js2atRequest objects. See provided content examples in the [example-page/](example-page) folder.

### Architecture

The Js2at infrastrastructure is currently implemented as:
- Browser extension under the [ext/](ext) directory.
- [Native message broker](message-broker), which is natively executable code that connects the AT to the browser extension
- A Js2atRequest polyfill that web content must import, included in the [polyfills/](polyfills) folder.

## Installation

### 1. Install the message broker

The message broker passes messages back and forth between an AT and the browser. It is compatible with Chrome and Firefox, but does not yet support Edge.

Make sure you have Python 2.x installed, Use <code>pip install zmq</code> to get the required zmq library.

On Windows, run <code>message-broker/install-broker-win.bat</code>
Otherwise, run <code>message-broker/install-broker.sh</code>

In Chrome OS, Js2at bypasses the message broker and communicates directly with each AT.

### 2. Install the browser extension

The extension is under ext, and can be loaded as an unpacked extension under
chrome://extensions.

The extension is compatible with Firefox, but Microsoft Edge needs to be tested.

## Running the examples

In either order:
- Run <code>example-at/example-at.py</code>
- Load the web page at [example-page/index.html sample web page] is located
in the example-page directory. You can't run it off the file system, because
browsers won't allow file:// urls to communicate with an extension, so run a
local server such as
via <code>python -m SimpleHTTPServer</code> and then load it from localhost.

You do not have to run the message broker, the browser launches it.

## Debugging tips

- Both the extension and web page will log their messages to their JS consoles.
- The message-broker will log to a file called
message-broker.log in the same directory as the messaging host.
Alternatively, launch chrome from a terminal to view logging output there.
- The example AT logs to stdout.


