// General schemas for requests, responses and internal commands from page.
// TODO Is it worth the extra network requests to put these in the schemas directory?
// TODO fill out descriptions

const kRequestSchema = {
  "type": "object",
  "required": ["requestId", "requestType", "targetAppId", "targetDocId",
    "targetUid", "detail"],
  "additionalProperties": false,
  "properties": {
    "requestId": {
      "type": "string",
    },
    "requestType": {
      "type": "string",
    },
    "targetAppId": {
      "type": "string",
    },
    "targetDocId": {
      "description": "Corresponds a specific HTML document or frame",
      "type": "string"
    },
    "targetUid": {
      "type": "string",
    },
    "timeout": {
      "description": "Time in ms before request is automatically cancelled",
      "type": "integer",
      "minimum": 1,
      "maximum": 10000,
    },
    "multiSend": {
      "description": "Can multiple responses be sent for the same request?",
      "type": "boolean"
    },
    "detail": {
      "type": "object"
    }
  }
}

const kResponseSchema = {
  "type": "object",
  "required": ["responseForRequestId", "isComplete", "detail"],
  "additionalProperties": false,
  "properties": {
    "responseForRequestId": {
      "type": "string",
    },
    "isComplete": {
      "type": "boolean"
    },
    "detail": {
      "type": "object"
    }
  }
}

const kObserverChangeSchema = {
  "type": "object",
  "required": ["$command", "type", "appId", "docId", "uid"],
  "additionalProperties": false,
  "properties": {
    "$command": {
      "type": "string",
      "enum": [ "observerAdded", "observerRemoved" ]
    },
    "type": {
      "description": "A url that defines requests and responses",
      "type": "string"
    },
    "appId": {
      "type": "string",
    },
    "docId": {
      "description": "Corresponds a specific HTML document or frame",
      "type": "string"
    },
    "uid": {
      "description": "The object that is listening and responding to requests of this type",
      "type": "string"
    }
  }
}

