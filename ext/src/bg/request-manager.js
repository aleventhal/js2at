class RequestManager {
  constructor() {
    this.openRequests = {};  // indexed by [docId][requestId]
    this.byDocPatternUid = {};
  }

  openRequest(docId, requestId, request) {
    if (!this.openRequests[docId])
      this.openRequests[docId] = {};
    this.openRequests[docId][requestId] = request;

    const key = docId + '\n' + request.pattern + '\n' + request.uid;
    this.byDocPatternUid[key] = this.byDocPatternUid[key] || new Set();
    this.byDocPatternUid[key].add(request.requestId);
  }

  closeRequest(docId, requestId) {
    console.assert(this.openRequests[docId]);
    const request = this.openRequests[docId][requestId];
    console.assert(request);

    delete this.openRequests[docId][requestId];
    const key = docId + '\n' + request.pattern + '\n' + request.uid;
    if (this.byDocPatternUid[key])
      this.byDocPatternUid[key].delete(requestId);
  }

  getRequestIds(docId, pattern, uid) {
    const key = docId + '\n' + pattern + '\n' + uid;
    return this.byDocPatternUid[key] || [];
  }

  getRequest(docId, requestId) {
    return this.openRequests[docId] && this.openRequests[docId][requestId];
  }
}

export default new RequestManager();
