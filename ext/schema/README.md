The schemas in this folder are used to validate the container objects for
requests, responses and internal commands. These schemas describe objects
that are transferred between the AT and the browser.

Web authors are not responsible for generating or understanding these formats,
as the js2at infrastructure will automatically populating these. This is in
contrast to the schemas in the top-level schemas/ folder, which describe
the detail object property of requests and responses for specific request types,
where the author needs to match the given format.

