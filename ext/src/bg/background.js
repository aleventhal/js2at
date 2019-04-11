chrome.runtime.onConnectExternal.addListener((port) => {

  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }

  if (!port.name.startsWith('js2at::'))
    return;  // Not handled.
  const params = port.name.split('::');
  // A new port has opened to listen to a single request type on a single
  // object.
  const requestType = params[1];
  const uid = params[2];
  console.log('Connect', params);


  if (true)
    return;

  //port.onDisconnect.addListener(() => onPortDisconnect(thing));
  port.onMessage.addListener(onPortMessage);

    // port.postMessage({
    //   message: 'ready',
    //   tab: tabId,
    //   rootNode: rootNodeData,
    //   allStates,
    //   allRoles
    // });
});

// We do not currently receive port messages, only send them
function onPortMessage() {
  //throw new Error('Port message unexpected');
}

function onPortDisconnect() {
}

