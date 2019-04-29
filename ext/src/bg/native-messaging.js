// Handle communcation with the js2at native broker.

  console.log('sendNativeMessage({ someObj }) will send a message to the ATs');

let nativePort;
function sendNativeMessage(message) {
  if (ensureNativeConnection())
    nativePort.postMessage(message);
}

function onNativeMessagingDisconnected() {
  if (chrome.runtime.lastError)
    console.log(chrome.runtime.lastError.message);
  nativePort = null;
}

function ensureNativeConnection(onNativeMessageCallback) {
  // If no listeners, that means the native port was disconnected externally.
  if (nativePort && nativePort.onMessage.hasListeners()) {
    return true;
  }
  var hostName = "org.js2at.chrome_native_messaging_host";
  nativePort = chrome.runtime.connectNative(hostName);
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }
  if (nativePort) {
    console.log('Native port connected', nativePort);
    nativePort.onMessage.addListener(onNativeMessageCallback);
    nativePort.onDisconnect.addListener(onNativeMessagingDisconnected);
    return true;
  }
}
