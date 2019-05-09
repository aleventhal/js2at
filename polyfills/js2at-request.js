/* eslint parserOptions: ["sourceType", "module"] */

import Js2atUniqueIdManager from './js2at-unique-id-manager.js';

export default class Js2atRequest {
  constructor(initObj) {
    // Instead of manually copying each field, set the prototype.
    Object.setPrototypeOf(this, initObj);

    this.target = Js2atUniqueIdManager.getTarget(this.uid);

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
        console.error('No errorDetail parameter provided');
      this.completeImpl({
        error: {
          errorDetail: errorDetail || 'General error',
          contentGenerated: true  // As opposed to generated by js2at itself.
        }
      });
      this.isComplete = true;
    };
  }
}
