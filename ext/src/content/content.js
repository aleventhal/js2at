// Transfer messages between page and background script.
// For page communication, open a single message channel that is used for all
// messages in this window.  TODO should page open up script so that it only
// happens when needed?
// For extension communication, opens up a port for extension api.
// Note: this could be done directly by page script in Chrome, but not Firefox,
// thus the indirection is necessary.

addEventListener('message', receivePort);

function receivePort(event) {
  if (event.data !== 'js2atChannelInit')
    return;
  console.assert(!receivePort.pageScriptPort);  // Make sure we don't try to set the port twice.

  const kExtensionId = 'jpgoldinadnmhfknenolkgbnockemnid';
  const backgroundScriptPort = chrome.runtime.connect(kExtensionId, {
    name: 'js2at'
  });
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
  }
  if (backgroundScriptPort) {
    removeEventListener('message', receivePort);
    receivePort.pageScriptPort = event.ports[0];
    receivePort.pageScriptPort.onmessage = (event) => {
      console.log('Content script sending to bg script', event.data);
      backgroundScriptPort.postMessage(event.data);  // Transfer to background script.
    }

    backgroundScriptPort.onMessage.addListener((data) => {
      console.log('Content script sending to page', data)
      receivePort.pageScriptPort.postMessage(data);  // Unused params: sender, sendResponseCallback.
    });
  }
}






