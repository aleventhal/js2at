/* eslint parserOptions: ["sourceType", "module"] */
/* Singleton service that creates and stores unique ids for any event target */

class Js2atUniqueIdManager {
  constructor() {
    this.targetToUid = new WeakMap();
    this.uidToTarget = new Map();
    this.counter = 0;
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
        this.removeTarget(removedNode);
  }

  remove(target, uid) {
    if (target instanceof EventTarget === false)
      throw new Error('The provided target must be an EventTarget, such as an Element.');
    this.targetToUid.delete(target);
    this.uidToTarget.delete(uid);
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

