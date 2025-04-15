import Schema from 'validno';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../../../utils/ApiError.js';
import { NextFunction, Request, Response } from 'express';
import { TUniAuth } from '../index.js';
import { HttpMethods } from '../../../constants.js';
import { ICustomRoute } from '../../../types/UniRouterTypes.js';

const MAX_USER_LOGINS = 3;

const bodyValidation = new Schema({
  email: {
    type: String,
    required: true,
    rules: {
      isEmail: 1,
    },
  },
  password: {
    type: String,
    required: true,
  },
});

const validateReqBody = (body: {[key: string]: any}) => {
  const result = bodyValidation.validate(body);
  if (result.ok !== true) throw new ApiError(400, result.joinErrors());
};

function signinController(uniAuthOptions: TUniAuth): ICustomRoute {
  const {jwtConfig} = uniAuthOptions;

  return {
    path: 'signin',
    method: HttpMethods.POST,
    controller: async function(req: Request, res: Response, next: NextFunction) {
      const body = req.body;
      validateReqBody(body);

      const {email, password} = body;
      // @ts-ignore
      const user = await new uniAuthOptions.models.UserModel().get({
        email,
      });

      const isPasswordChecked = await bcrypt.compare(password, user.data()?.password);
      if (isPasswordChecked !== true) throw new ApiError(401, 'Некорректный пароль');

      let sessionIndex = 0;

      // @ts-ignore
      const lastSessionIndex = await uniAuthOptions.db.tokensCollection.aggregate([
        {$match: {
          user: user.data()._id,
          type: 'refresh',
        }},
        {$sort: {
          createdAt: -1,
        }},
        {$limit: 1},
      ]);

      if (lastSessionIndex.result.length) {
        const lastIndex = lastSessionIndex.result[0].session;
        // eslint-disable-next-line max-len
        sessionIndex = lastSessionIndex.result[0].session === MAX_USER_LOGINS ? 0 : lastIndex + 1;
      }

      const tokenPayload = {
        _id: user.data()._id.toString(),
        email: user.data().email,
        ws: '',
        session: sessionIndex,
      };

      const accessToken = jwt.sign(
          tokenPayload,
          jwtConfig.accessTokenSecret,
          {expiresIn: jwtConfig.accTokenLiveTime},
      );

      const refreshToken = jwt.sign(
          tokenPayload,
          jwtConfig.refreshTokenSecret,
          {expiresIn: jwtConfig.refTokenLiveTime},
      );

      // @ts-ignore
      await uniAuthOptions.db.tokensCollection.deleteMany({
        query: {
          user: user.data()._id,
          session: sessionIndex,
        },
      });

      const token = await new uniAuthOptions.models.TokenModel().init({
        user: user.data()._id,
        type: 'refresh',
        token: refreshToken,
        session: sessionIndex,
        updatedAt: new Date(),
        createdAt: new Date(),
      });

      await token.save(true);

      const response = {
        ok: true,
        tokens: {
          access: accessToken,
          refresh: refreshToken,
        },
        session: sessionIndex,
      };

      res.json(response);
    },
    middlewares: [],
  };
}

export default signinController;
