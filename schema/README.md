# Schemas

The schemas in this directory describe the details object in a request or response. The schema used is specified in the request objects pattern property, which contains a URL linking to a schema publicly-available on the web.

The process for developing or changing a request/response schema currently involves submitting a PR to the contents of this directory. [JSON schema](https://json-schema.org) is an IETF draft standard.

# Sub-schemas

Common objects such as points or nodes are defined in the [common/](common) folder and referenced via $ref.

Note: schemas for container objects that send requests, responses and commmands are provided in /ext/schema.
