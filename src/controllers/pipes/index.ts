import extractUser from './extractUser.js';
import handleBody from './handleBody.js';
import validateBody from './validateBody.js';
import validateReq from './validateReq.js';

class Pipes {
  static validateReqPipe = validateReq;
  static handleBody = handleBody;
  static extractUser = extractUser;
  static validateBody = validateBody;

  constructor() {}
}

export default Pipes;