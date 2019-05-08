class RequestManager {
  constructor() {
    this.openRequests = {};  // indexed by [docId][requestId]
  }

  openRequest(docId, requestId, request) {
    if (!this.openRequests[docId])
      this.openRequests[docId] = {};
    this.openRequests[docId][requestId] = request;
  }

  closeRequest(docId, requestId) {
    console.assert(this.openRequests[docId]);
    console.assert(this.openRequests[docId][requestId]);
    delete this.openRequests[docId][requestId];
  }

  getRequest(docId, requestId) {
    return this.openRequests[docId] && this.openRequests[docId][requestId];
  }

  closeDoc(docId) {
    // TODO hook up a caller
    // TODO should send cancelled messages?
    delete this.openRequests[docId];
  }
}

export default new RequestManager();
