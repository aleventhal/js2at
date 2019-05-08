// Transfer messages between page and background script.
// For page communication, listents on a single message channel that is used for
// all messages in this window.
// For extension communication, opens up a port for extension api.
// Advantages over direct communication between page and background script:
// - Can work in Firefox
// - No need for "externally-connectable" domain whitelist in manifest.json,
//   where every site using js2at would need to be explicitly listed.

addEventListener('message', receivePort);

function receivePort(event) {
  if (event.data !== 'js2atChannelInit')
    return;
  console.assert(!receivePort.pageScriptPort);  // Make sure we don't try to set the port twice.

  const kExtensionId = 'jpgoldinadnmhfknenolkgbnockemnid';
  const backgroundScriptPort = chrome.runtime.connect(kExtensionId, {
    name: 'js2at',  // Could pass info through this way.
    includeTlsChannelId: false  // TODO better understand this
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
      if (data['$command']) {
        if (data['$command'] === 'initIds') {
          // Temporary hack so that the AT can discover the app and frameId and know
          // where to send information.
          document.documentElement.id = 'js2at:' + data.appId + ':' + data.docId;
        }
        return;
      }
      console.log('Content script sending to page', data)
      receivePort.pageScriptPort.postMessage(data);  // Unused params: sender, sendResponseCallback.
    });
  }
}






