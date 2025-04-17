import {ObjectId} from 'mongodb';
import jwt from 'jsonwebtoken';
import UniController from '../../../controllers/UniController.js';
import ApiError from '../../../utils/ApiError.js';
import { NextFunction } from 'express';
import { TReq, TRes } from '../../../types/express.js';
import { TUniAuth } from '../index.js';
import { UniAuthErrorMessages } from '../constants.js';

const errorsByMessage = {
  'jwt expired': {
    text: UniAuthErrorMessages.ACCESS_TOKEN_EXPIRED,
    code: 401,
  },
};

function authUserMw(this: TUniAuth, req: TReq, res: TRes, next: NextFunction) {
  try {
    if (!req.__uniAuth) throw new Error(UniAuthErrorMessages.MISSING_UNI_AUTH);
    
    const accessToken = req.headers.authorization || req.headers.Authorization;
    if (!accessToken) throw new ApiError(401, UniAuthErrorMessages.MISSING_ACCESS_TOKEN);

    const decryptedJWT = jwt.verify(accessToken, this.jwtConfig.accessTokenSecret);

    req.__uniAuth = {
      authed: true,
      user: {
        _id: new ObjectId(decryptedJWT._id),
        email: decryptedJWT.email,
        workspace: decryptedJWT.workspace,
        session: decryptedJWT.session,
        tokens: {
          access: String(accessToken),
        },
      }
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
