chrome.runtime.onConnect.addListener((port) => {

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
  console.log('Im')



  port.onDisconnect.addListener(() => onPortDisconnect(thing));
  port.onMessage.addListener(onPortMessage);

  console.info('Connected to automation client with tab id = ' + tabId);

  const automationTree = new AutomationTree(port, tabId);
  automationTree.init()
  .then((response) => {
    if (portToTreeMap.size === 0) {
      onFirstConnectionAdded();
    }
    const rootNode = response;
    portToTreeMap.set(tabId, automationTree);
    rootToTreeMap.set(rootNode, automationTree);
    const rootNodeData = automationTree.getNodeData(rootNode);
    const allStates = Object.values(chrome.automation.StateType);
    const allRoles = Object.values(chrome.automation.RoleType);

    port.postMessage({
      message: 'ready',
      tab: tabId,
      rootNode: rootNodeData,
      allStates,
      allRoles
    });
  })
  .catch((error) => {
    port.postMessage({
      message: 'error',
      tab: tabId,
      error: error.toString()
    });
  });
});

function onFirstConnectionAdded() {
  console.info('Begin listening to treeChanges');
  chrome.automation.addTreeChangeObserver('allTreeChanges', onTreeChange);
}

function onLastConnectionRemoved() {
  console.info('End listening to treeChanges');
  chrome.automation.removeTreeChangeObserver(onTreeChange);
}

// We do not currently receive port messages, only send them
function onPortMessage() {
  throw new Error('Port message unexpected');
}

function onPortDisconnect(tabId) {
  const tree = getTree(tabId);
  if (tree) {
    tree.removeEventListeners();
    rootToTreeMap.delete(tree.rootNode);
    portToTreeMap.delete(tabId);
    if (portToTreeMap.size === 0) {
      onLastConnectionRemoved();
    }
  }
}

