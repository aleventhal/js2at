// TODO track all the ports, ids, types, etc.
let requestId = 1;
let contentRequestPort;
let targetUid;

chrome.runtime.onConnectExternal.addListener((port) => {

  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }

  if (!port.name.startsWith('js2at::'))
    return;  // Not handled.

  port.onDisconnect.addListener(onPortDisconnect);
  const params = port.name.split('::');
  // A new port has opened to listen to a single request type on a single
  // object.
  const requestType = params[1];
  targetUid = params[2];
  console.log('Connected!', port);
  contentRequestPort = port;

  port.onMessage.addListener(onPortMessage);
  sendContentRequest(
    'fetchAll',
    {
      'role': 'heading'
    }
  );
  connectNative();
});

function sendContentRequest(type, detail) {

  const request = {
    type,
    requestId: ++ requestId,
    targetUid,
    timeout: 3000,
    multiSend: false,
    detail
  }

  contentRequestPort.postMessage(request);
}

function onPortMessage(message) {
  console.log('Message received!', message);
  sendNativeMessage(message);

}

function onPortDisconnect(port) {
  console.log('Port disconnected', port.name);
}

