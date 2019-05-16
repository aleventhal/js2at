// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
    if (!this.openRequests[docId])
      return;
    const request = this.openRequests[docId][requestId];
    console.assert(request);
    if (!request)
      return;

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
