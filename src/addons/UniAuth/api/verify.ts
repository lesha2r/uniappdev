import jwt from 'jsonwebtoken';
import Schema from 'validno';
import ApiError from '../../../utils/ApiError.js';
import { NextFunction } from 'express';
import { TUniAuth } from '../index.js';
import { HttpMethods } from '../../../constants.js';
import { TReq, TRes } from '../../../types/express.js';
import middlewares from '../middlewares/index.js';
import { ICustomRoute } from '../../../types/UniRouterTypes.js';

function verifyController(uniAuthOptions: TUniAuth): ICustomRoute {
  return {
    path: 'verify',
    method: HttpMethods.GET,
    middlewares: [
      (...args) => middlewares.setReqUniAuthObj.call(uniAuthOptions, ...args),
      (...args) => middlewares.authUserMw.call(uniAuthOptions, ...args),
    ],
    controller: async (req: TReq, res: TRes, next: NextFunction) => {
      try {
        jwt.verify(req.__uniAuth?.user.tokens.access, uniAuthOptions.jwtConfig.accessTokenSecret);

        res.json({ok: true});
      } catch (err: any) {
        if (err.message === 'jwt expired') throw new ApiError(401, 'Refresh token is expired')
        else if (err.message === 'Nothing found') throw new ApiError(401, 'Refresh token is not valid')

        throw err
      }
    },
  };
};

export default verifyController;
