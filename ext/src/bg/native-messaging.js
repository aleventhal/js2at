let nativePort;
function sendNativeMessage(message) {
  if (!nativePort)
    return;
  nativePort.postMessage(message);
}

function onNativeMessage(message) {
  if (!nativePort)
    return;
  console.log(message)
  sendNativeMessage({dogs: 1});
}

function onNativeMessagingDisconnected() {
  if (!nativePort)
    return;
  if (chrome.runtime.lastError)
    console.log(chrome.runtime.lastError.message);
  nativePort = null;
}

function connectNative() {
  if (nativePort) {
    console.log('Already connected');
    return;
  }
  var hostName = "org.js2at.chrome_native_messaging_host";
  nativePort = chrome.runtime.connectNative(hostName);
  if (nativePort) {
    nativePort.onMessage.addListener(onNativeMessage);
    nativePort.onDisconnect.addListener(onNativeMessagingDisconnected);
  }
  return nativePort;
}

connectNative();
