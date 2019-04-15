const kTestATRequestIdSuffix = '-' + Math.random().toString(36).substring(2,11);

// Returns if a value is an object
function isObject(value) {
  return value && typeof value === 'object' && value.constructor === Object;
}

function Js2atRequestData(initObj) {
  if (initObj.type instanceof 'URL' === false)
    throw new Error('A Js2at requestType of type URL must be supplied.');
  this.type = initObj.type;

  // Will be converted into EventTarget on client side.
  this.targetUuid = initObj.targetUuid;  // TODO: optional?

  if (isObject(initObj.detail))
    throw new Error('A detail object must be supplied, even if it is an empty object.');
  this.detail = initObj.detail;

  this.multiSend = Boolean(initObj.multiSend);
}

function simulateATFiringRequest(data) {
  const outSlot = document.getElementById('at2js-slot');
  outSlot.value = JSON.stringify(data);
  // For testing from JS, we need to dispatch an artificial
  // input event as this is not generated by simply setting the value.
  const event = new Event('input', {
    'bubbles': true,
    'cancelable': true
  });
  outSlot.dispatchEvent(event);
}

function createTestRequestData(requestType, detail) {
  createTestRequestData.requestId = createTestRequestData.requestId ? createTestRequestData.requestId + 1 : 1;
  return {
    requestId: createTestRequestData.requestId + kTestATRequestIdSuffix,
    requestType: 'http://js2at.org/schema/' + requestType + '.json',
    detail: detail
  };
}

function generateTestRequest(requestType, detail) {
  const data = createTestRequestData(requestType, detail);
  simulateATFiringRequest([ data ]);
}

function generateTestHeadingRequest() {
  generateTestRequest('fetchAll', {
    role: 'heading'  // TODO role=heading
  });
}

function generateMultipleTestRequests() {
  const data = [
    createTestRequestData('fetchAll', { role: 'heading' } ),
    createTestRequestData('fetchAll', { role: 'p' } )
  ];

  simulateATFiringRequest( data );
}
