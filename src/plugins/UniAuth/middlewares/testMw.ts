import { NextFunction, Request, Response } from 'express';
import UniController from '../../../controllers/UniController.js';
import ApiError from '../../../utils/ApiError.js';
import { UniAuthErrorMessages } from '../constants.js';

const testMw = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[AUTH mw] testMw');
    next();
  } catch (_) {
    const err = new ApiError(500, UniAuthErrorMessages.INTERNAL_ERROR);
    UniController.resErr(err, req, res);
  }
};

export default testMw;
