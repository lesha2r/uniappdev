import jwt from 'jsonwebtoken';
import Schema from 'validno';
import ApiError from '../../../utils/ApiError.js';
import { NextFunction } from 'express';
import { TUniAuth } from '../index.js';
import { HttpMethods } from '../../../constants.js';
import { TReq, TRes } from '../../../types/express.js';
import middlewares from '../middlewares/index.js';
import { ICustomRoute } from '../../../types/UniRouterTypes.js';
import { UniAuthTokenTypes } from '../constants.js';

const reqBodySchema = new Schema({
  refresh: {
    type: String,
    required: true,
  },
});

const validateReqBody = (body: {[key: string]: any}) => {
  const result = reqBodySchema.validate(body);
  if (!result.ok) throw new ApiError(400, result.joinErrors());
};

const refreshController = (uniAuthOptions: TUniAuth): ICustomRoute => {
  const {jwtConfig} = uniAuthOptions;

  return {
    path: 'refresh',
    method: HttpMethods.POST,
    middlewares: [
      middlewares.setReqUniAuthObj
    ],
    controller: async (req: TReq, res: TRes, next: NextFunction) => {
      try {
        const body = req.body;
        validateReqBody(body);
        const {refresh} = body;

        const tokenData = jwt.verify(refresh, uniAuthOptions.jwtConfig.refreshTokenSecret);

        const userIdByToken = await new uniAuthOptions.models.TokenModel().get({
            type: UniAuthTokenTypes.REFRESH,
            token: refresh,
          });

        const tokenPayload = {
          _id: userIdByToken.data().user,
          email: tokenData.email,
          ws: '',
          session: tokenData.session,
        };

        const accessToken = jwt.sign(
            tokenPayload,
            jwtConfig.accessTokenSecret,
            {expiresIn: jwtConfig.accTokenLiveTime},
        );

        res.json({ok: true, tokens: {
          access: accessToken,
        }});
      } catch (err: any) {
        if (err.message === 'jwt expired') throw new ApiError(401, 'Refresh token is expired')
        else if (err.message === 'Nothing found') throw new ApiError(401, 'Refresh token is not valid')

        throw err
      }
    },
  };
};

export default refreshController;
