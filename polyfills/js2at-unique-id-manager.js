/* eslint parserOptions: ["sourceType", "module"] */

// TODO: should we observe whether nodes become attached / detached?
// Otherwise technically we'll hold onto nodes unnecessarily.

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
  }

  remove(target, uid) {
    if (target instanceof EventTarget === false)
      throw new Error('The provided target must be an EventTarget, such as an Element.');
    this.targetToUid.remove(target);
    this.uidToTarget.remove(uid);
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

