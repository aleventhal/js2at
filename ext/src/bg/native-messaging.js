let nativePort;
function sendNativeMessage(message) {
  if (!nativePort)
    return;
  nativePort.postMessage(message);
}

function onNativeMessagingDisconnected() {
  if (!nativePort)
    return;
  if (chrome.runtime.lastError)
    console.log(chrome.runtime.lastError.message);
  nativePort = null;
}

function ensureNativeConnection(onNativeMessageCallback) {
  if (nativePort) {
    console.log('Already connected');
    return true;
  }
  var hostName = "org.js2at.chrome_native_messaging_host";
  nativePort = chrome.runtime.connectNative(hostName);
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }
  if (nativePort) {
    nativePort.onMessage.addListener(onNativeMessageCallback);
    nativePort.onDisconnect.addListener(onNativeMessagingDisconnected);
    return true;
  }
}
