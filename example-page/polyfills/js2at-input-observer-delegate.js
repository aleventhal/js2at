// TBD

// Web Communication Gateway

// Random suffix for message ids.
const messageIdSuffix = '-' + Math.random().toString(36).substring(2,11);
const js2atReadyInfo = {
  serverVersion: 1,
  supportedMessageTypes: ['fetchAll']  // TODO do not hardcode. Is this overkill?
};

const messageOutQueue = [];
let queueTimeout;
let inputFromAT;
let inputFromATCommitButton;
let outputToAT;

function flushOutgoingMessageQueue() {
  if (!messageOutQueue.length)
    return; // Nothing to send.

  outputToAT.value = JSON.stringify(messageOutQueue);

  messageOutQueue.length = 0;  // Clear the queue.

  clearTimeout(queueTimeout);  // Make sure timeout is cleared

  console.log('Sent', outputToAT.value, '\nExplore:', JSON.parse(outputToAT.value));
}

function atSend(messageType, custom) {
  // Increment automatic id counter.
  atSend.messageId = atSend.messageId ? atSend.messageId + 1 : 1;

  // Wrapped data includes automatically populated fields.
  const wrapped_data = {
    messageType: messageType,
    messageId: atSend.messageId + messageIdSuffix,
    custom: custom
  };

  messageOutQueue.push(wrapped_data);

  clearTimeout(queueTimeout);
  queueTimeout = setTimeout(flushOutgoingMessageQueue, 0);

  return atSend.messageId;
}

// If custom is undefined then the message will be considered "not handled".
function atRespond(responseForMessageId, data, messageType) {
  // Wrapped data includes automatically populated fields.
  const wrapped_data = {
    messageType: messageType,
    responseForMessageId: responseForMessageId,
    custom: data
  };

  messageOutQueue.push(wrapped_data);

  clearTimeout(queueTimeout);
  queueTimeout = setTimeout(flushOutgoingMessageQueue, 0);
}

// If custom is undefined then the message will be considered "not handled".
function atResolve(responseForMessageId, data) {
  // Wrapped data includes automatically populated fields.
  atRespond('resolve', responseForMessageId, data);
}

function atReject(responseForMessageId, data) {
  atRespond('reject', responseForMessageId, data);
}

// IE custom event polyfill.
(function () {
  if ( typeof window.CustomEvent === 'function' ) return false;
  function CustomEvent (event, params) {
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

function sendReadyMessage() {
  atSend('ready', js2atReadyInfo);
}

function checkReady(event) {
  const detail = event.detail;
  const responseForMessageId = detail.messageId;
  atResolve(responseForMessageId, js2atReadyInfo);
  event.preventDefault();
}

function atReceive(event) {
  const messages = JSON.parse(inputFromAT.value); // Array
  console.log('Received', JSON.stringify(messages), '\nExplore:', messages);
  if (!Array.isArray(messages)) {
    return; // Error
  }

  event.target.value = '';

  for (let index = 0; index < messages.length; index ++) {
    const message = messages[index];
    const customEvent = new CustomEvent('at2js:' + message.messageType, { detail : message, cancelable : true });
    window.dispatchEvent(customEvent);
    if (!customEvent.defaultPrevented) {
      // Not handled: send not handled response.
      atReject(message.messageId, { errorType : 'unsupported' });
    }
  }
}

/*
atCancelOneSend(id) {
}

atCancelAllSend() {
}
*/

function addPolyfillInput(container, id) {
  const elem = document.createElement('input');
  elem.tabIndex = -1;
  elem.id = id;

  container.appendChild(elem);
  return elem;
}

// If optionalPolyfillContainer is not provided, the <html> element will be used.
function init(optionalPolyfillContainer) {
  const polyfillContainer = optionalPolyfillContainer || document.documentElement;
  const polyfillHider = document.createElement('div');
  const polyfillHiderId = 'js2at-polyfill';
  polyfillHider.id = polyfillHiderId;
  polyfillHider.style.position = 'absolute';
  polyfillHider.style.left = '-9999px';
  polyfillHider.style.width = '1px';
  polyfillHider.style.height = '1px';
  // Do not render within screen reader virtual buffers.
  // polyfillHider.setAttribute('aria-hidden', 'true');

  polyfillContainer.appendChild(polyfillHider);
  inputFromAT = addPolyfillInput(polyfillHider, 'at2js-slot');
  inputFromAT.addEventListener('input', atReceive);
  const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
  if (isIE11) {
    inputFromAT.addEventListener('focus', function(evt) {
      // IE11: put_accValue() does not cause input or change event,
      // but causes focus change both fortunately and unfortunately.
      atReceive(evt);
      window.lastFocus && window.lastFocus.focus();
    });
    window.addEventListener('focusin', function(evt) {
      if (evt.target !== inputFromAT)
        window.lastFocus = evt.target;
    });
  }
  outputToAT = addPolyfillInput(polyfillHider, 'js2at-slot');
  // Help AT find the "input from AT" field.
  // TODO This is a little weird, is it even necessary? Would it make more sense if the controls
  // relation went the other direction? Unfortunately we'd have to add an id to the container for that.
  document.documentElement.setAttribute('aria-controls', polyfillHiderId);

  setTimeout(sendReadyMessage, 100);

  window.addEventListener('at2js:checkReady', checkReady);  // Provide built-in handler for this one.
}

setTimeout(init, 0); // Defer until document body is available.



