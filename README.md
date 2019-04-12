## Welcome to Js2at

Please see the [example-page/index.html self-documenting demo].
You can't run it off the file system, because it won't allow communication with
the extension, so I run python -m SimpleHTTPServer and then load it from
localhost.

The extension is under ext. Right now it just dumps to the background console.

The non-polyfill web page code, which is all the code that would ideally be
required if the browser implemented js2at, is in example-page/demo.js.

Note: the C++ client under tools was used for the hidden input polyfill, which
doesn't work at the moment. We may restore that demo later, so I'm keeping it
around.

