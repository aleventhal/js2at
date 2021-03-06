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

/* eslint parserOptions: ["sourceType", "module"] */
/* Singleton service that creates and stores unique ids for any event target */

class Js2atUniqueIdManager {
  constructor() {
    this.targetToUid = new WeakMap();
    this.uidToTarget = new Map();
    this.counter = 0;
    this.uidRemovedCallbacks = [];

    window.addEventListener('beforeunload', () => {
      for (let [uid, target] of this.uidToTarget.entries())
        this.remove(target, uid);
    });
  }

  addUidRemovedListener(callback) {
    this.uidRemovedCallbacks.push(callback);
  }

  add(target, uid) {
    if (target instanceof EventTarget === false)
      throw new Error('The provided target must be an EventTarget, such as an Element.');
    this.targetToUid.set(target, uid);
    this.uidToTarget.set(uid, target);
    if (target.parentNode) {
      // Observe removed children. Can't be done on root since there is no parent,
      // but once the root is removed that means the document has gone away,
      // in which case this singleton will be destroyed and the memory released.
      if (!this.mutationObserver)
        this.mutationObserver = new MutationObserver((mutationsList) => { this.onParentMutation(mutationsList); });
      this.mutationObserver.observe(target.parentNode, { childList: true });
    }
  }

  onParentMutation(mutationsList) {
    // An element with a unique id may have been removed, because its parent
    // has reported a change in its child nodes.
    for(var mutation of mutationsList)
      for (let removedNode of mutation.removedNodes)
        if (this.targetToUid.has(removedNode))
          this.removeTarget(removedNode);
  }

  remove(target, uid) {
    if (target instanceof EventTarget === false)
      throw new Error('The provided target must be an EventTarget, such as an Element.');
    this.targetToUid.delete(target);
    this.uidToTarget.delete(uid);
    for (let uidRemovedCallback of this.uidRemovedCallbacks)
      uidRemovedCallback(uid);
  }

  removeTarget(target) {
    this.remove(target, this.getUid(target));
  }

  removeUid(uid) {
    this.remove(this.getTarget(uid), uid);
  }

  getTarget(uid) {
    return this.uidToTarget.get(uid);
  }

  getUid(target) {
    if (target instanceof EventTarget === false)
      throw new Error('The provided target must be an EventTarget, such as an Element.');
    return this.targetToUid.get(target);
  }

  getOrCreateUid(target) {
    const uid = this.getUid(target);
    if (uid)
      return uid.toString();

    const newUid = this.createUid();
    this.add(target, newUid);
    return newUid;
  }

  createUid() {
    ++ this.counter;
    return this.counter.toString();
  }
}

export default new Js2atUniqueIdManager();

