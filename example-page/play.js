

const kFetchAllInterface = 'http://blah/fetchAll.json';
const kWachFocusInterface = 'http://blah/activeItem.json';

const kInterfaces = [ kFetchAllUrl, kWatchFocusInterface ];

async navigator.accessibility.exposeInterfaces(kInterfaces, onSubscribe, onUnsubscribe);


async navigator.accessibility.exposeInterfaces(kInterfaces, onRequest, onCancel);

function onRequest(request) {
  request.complete();
  request.next();
  request.error();


  request.resolve();
  request.reject();
}
