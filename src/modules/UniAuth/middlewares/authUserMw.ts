import {ObjectId} from 'mongodb';
import jwt from 'jsonwebtoken';
import UniController from '../../../controllers/UniController.js';
import ApiError from '../../../utils/ApiError.js';
import { NextFunction } from 'express';
import { TReq, TRes } from '../../../types/express.js';

const errorsByMessage = {
  'jwt expired': {
    text: 'Токен просрочен',
    code: 401,
  },
};

const authUserMw = (req: TReq, res: TRes, next: NextFunction) => {
  try {
    console.log('[AUTH mw] authUserMw');

    if (!req.__uniAuth) throw new Error('__uniAuth missing in request object');
    
    const accessToken = String(req.headers.authorization || req.headers.Authorization);

    if (!accessToken) throw new ApiError(401, 'Не авторизован');
    const decryptedJWT = jwt.verify(accessToken, 'testtesttest');

    req.__uniAuth.user = {
      _id: new ObjectId(decryptedJWT._id),
      email: decryptedJWT.email,
      workspace: decryptedJWT.workspace,
      session: decryptedJWT.session,
      tokens: {
        access: accessToken,
      },
    };

    next();
  } catch (err: any) {
    const apiError = new ApiError(500, err.message);

    if (err && err.message && err.message in errorsByMessage === true) {
      //@ts-ignore
      apiError.message = errorsByMessage[err.message].text;
      // @ts-ignore
      apiError.code = errorsByMessage[err.message].code;
    }

    UniController.resErr(apiError, req, res);
  }
};

export default authUserMw;
