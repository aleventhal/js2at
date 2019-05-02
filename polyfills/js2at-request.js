/* eslint parserOptions: ["sourceType", "module"] */

import Js2atUniqueIdManager from './js2at-unique-id-manager.js';

export default class Js2atRequest {
  constructor(initObj) {
    // Instead of manually copying each field, set the prototype.
    Object.setPrototypeOf(this, initObj);

    this.target = Js2atUniqueIdManager.getTarget(this.targetUid);

    if (this.multiSend) {
      // Only provide sendOne() callback when it's possible to send more.
      this.sendOne = (detail) => {  // detail is required.
        if (!detail)
          throw new Error('No detail parameter provided');
        if (this.isComplete)
          return;
        this.sendOneImpl(detail);
      };
    }
    this.complete = (detail) => {  // detail is optifonal.
      if (this.isComplete)
        return;
      this.completeImpl(detail);
      this.isComplete = true;
    };
    this.error = (errorDetail) => {  // errorDetail is required.
      if (!errorDetail)
        throw new Error('No errorDetail parameter provided');
      this.errorImpl(errorDetail);
      this.completeImpl();
      this.isComplete = true;
    };
  }
}