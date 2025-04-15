import { NextFunction, Request, Response } from 'express';
import UniController from '../../../controllers/UniController.js';
import ApiError from '../../../utils/ApiError.js';

const testMw = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[AUTH mw] testMw');
    req.user = {};
    req.user.ws = '670f975c1f546e36380af7e3';
    req.user._id = '6729edabc04aa42159f6ad16';
    next();
  } catch (_) {
    const err = new ApiError(500, 'Внутренняя ошибка сервера');
    UniController.resErr(err, req, res);
  }
};

export default testMw;
