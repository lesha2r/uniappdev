import Schema from 'validno'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ApiError from '../../../utils/ApiError.js'
import { TUniAuth } from '../index.js';
import config from '../config.js';
import { UniAuthErrorMessages, UniAuthTokenTypes } from '../constants.js';

const MAX_USER_LOGINS = config.maxLoginsPerUser;

const signinDataSchema = new Schema({
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

const validateData = (body: {[key: string]: any}) => {
  const result = signinDataSchema.validate(body);
  if (result.ok !== true) throw new ApiError(400, result.joinErrors());
};

const signinService = async (uniAuthOptions: TUniAuth, body: {email: string, password: string}) => {
    validateData(body);
    const {jwtConfig} = uniAuthOptions;

    const {email, password} = body;
    // @ts-ignore
    const user = await new uniAuthOptions.models.UserModel().get({
        email,
    });

    const isPasswordChecked = await bcrypt.compare(password, user.data()?.password);
    if (isPasswordChecked !== true) throw new ApiError(401, UniAuthErrorMessages.WRONG_PASSWORD);

    let sessionIndex = 0;

    // @ts-ignore
    const lastSessionIndex = await uniAuthOptions.db.tokensCollection.aggregate([
      {$match: {
          user: user.data()._id,
          type: UniAuthTokenTypes.REFRESH,
      }},
      {$sort: {
          createdAt: -1,
      }},
      {$limit: 1},
    ]);

    if (lastSessionIndex.result.length) {
      const lastIndex = lastSessionIndex.result[0].session;
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
        type: UniAuthTokenTypes.REFRESH,
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

    return response
}

export default signinService