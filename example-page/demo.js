import Js2atObserver from './polyfills/js2at-observer.js';
import Js2atUniqueIdManager from './polyfills/js2at-unique-id-manager.js';

export default function js2AtDemo(Js2atRequest) {
  console.log(Js2atUniqueIdManager);

  const kFetchAllRequestType = new URL('http://js2at.org/schema/fetchAll.json');
  const fetchRequestObserver = new Js2atObserver(kFetchAllRequestType, fetchAll, cancelFetchAll);
  fetchRequestObserver.observe(document);

  function fetchAll(request) {
    const detail = request.detail;
    const custom = detail.custom;
    const responseForMessageId = detail.messageId;
    if (!custom || custom.role !== 'heading') {
      // TODO programmatic error codes?
      request.error({ error : 'Only headings handled'});
      return;
    }

    const headings = document.querySelector('h1');
    const objectsResult = {};
    for (let index = 0; index < headings.length; index ++) {
      const heading = headings[index];
      objects.push({
        role: 'heading',
        name: heading.innerText,
        uid: Js2atUniqueIdManager.getOrCreateUid(heading)
      });
    }

    request.complete(objectsResult);
  }

  function cancelFetchAll(request) {
    console.log('cancelled');
  }
}


