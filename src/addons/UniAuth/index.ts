/* eslint-disable require-jsdoc */

import mongomod from 'mongomod';
import userSchema, {userMongoSchema} from './schemas/userSchema.js';
import tokenSchema, {tokenMongoSchema} from './schemas/tokenSchema.js';
import buildAuthApi from './api/index.js';
import config from './config.js';
import _common from '../../utils/_common.js';
import { COL_NAME_PREFIX_TOKENS, UniAuthErrorMessages, UniAuthTypes } from './constants.js';
import authUserMw from './middlewares/authUserMw.js';
import setReqUniAuthObj from './middlewares/setReqUniAuthObj.js';
import { AuthActions } from '../../constants.js';
import _validateConfig from './utils/_validateConfig.js';
import { TReq, TRes } from '../../types/express.js';
import { NextFunction } from 'express';

export interface AuthCreateInput {
  name: string;
  dbCredentials: DbCredentials;
  dbName: string;
  dbCollection?: string;
  dbTokensCollection?: string;
  type: string;
  jwtConfig: AuthCreateInputJWT;
  allowedActions?: AuthActions[]
}

interface AuthCreateInputJWT {
  accessSecret: string;
  refreshSecret: string;
  accessLiveTime?: string;
  refreshLiveTime?: string;
}

export interface JwtConfiguration {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accTokenLiveTime: string;
  refTokenLiveTime: string;
}

interface Models {
  UserModel: any;
  TokenModel: any;
  userSchema: typeof userSchema;
  tokenSchema: typeof tokenSchema;
}

interface DbCredentials {
  link: string;
  login: string;
  password: string;
  dbName: string;
  debug: boolean;
  srv: boolean;
  collection?: string;
  tokensCollection?: string;
}

export type TUniAuth = {
  name: string;
  type: string;
  jwtConfig: JwtConfiguration;
  dbInfo: {
    dbName: string;
    dbCollectionName: string;
    dbTokensCollectionName: string;
  }
  db: {
    connection: ReturnType<typeof mongomod.Connection>;
    collection: ReturnType<typeof mongomod.Controller> | null;
    tokensCollection: ReturnType<typeof mongomod.Controller> | null;
  }
  models: Models;
  allowedActions: AuthActions[];
  api: any;
}

class UniAuth implements TUniAuth {
  name: string;
  type: string;
  jwtConfig: JwtConfiguration;
  dbInfo: {
    dbName: string;
    dbCollectionName: string;
    dbTokensCollectionName: string;
  };
  db: {
    connection: ReturnType<typeof mongomod.Connection>;
    collection: ReturnType<typeof mongomod.Controller> | null;
    tokensCollection: ReturnType<typeof mongomod.Controller> | null;
  };
  models: Models;
  allowedActions: AuthActions[];
  api: any;

  constructor(input: AuthCreateInput) {
    _validateConfig.validate(input);

    this.name = input.name || config.authNameDefault;
    this.type = input.type || config.authTypeDefault;
    this.jwtConfig = {
      accessTokenSecret: input.jwtConfig.accessSecret,
      refreshTokenSecret: input.jwtConfig.refreshSecret,
      accTokenLiveTime: input.jwtConfig.accessLiveTime || config.jwtDefaults.accessToken.expiresIn,
      refTokenLiveTime: input.jwtConfig.refreshLiveTime || config.jwtDefaults.refreshToken.expiresIn,
    };

    this.dbInfo = {
      dbName: input.dbCredentials.dbName,
      dbCollectionName: input.dbCredentials.collection || input.name,
      dbTokensCollectionName:
        input.dbCredentials.tokensCollection || input.name + COL_NAME_PREFIX_TOKENS,
    };

    this.db = {
      connection: new mongomod.Connection({
        link: input.dbCredentials.link,
        login: input.dbCredentials.login,
        password: input.dbCredentials.password,
        dbName: input.dbCredentials.dbName,
        debug: input.dbCredentials.debug,
        srv: input.dbCredentials.srv,
      }),
      collection: null,
      tokensCollection: null,
    };

    this.db.collection = new mongomod.Controller(this.db.connection, this.dbInfo.dbCollectionName);
    this.db.tokensCollection = new mongomod.Controller(this.db.connection, this.dbInfo.dbTokensCollectionName);
    this.db.connection.connect();

    this.models = {
      UserModel: mongomod.createModel(
        this.db.connection,
        this.name,
        new mongomod.Schema(userMongoSchema),
      ),
      TokenModel: mongomod.createModel(
        this.db.connection,
        this.name + COL_NAME_PREFIX_TOKENS,
        new mongomod.Schema(tokenMongoSchema),
      ),
      userSchema,
      tokenSchema,
    };

    this.allowedActions = input.allowedActions || Object.values(AuthActions)

    this.ensureIndex()
    this.api = buildAuthApi(this);
  }

  /**
   * Creates unique index for email field in the DB collection
   */
  async ensureIndex(tryCount = 0, maxTryCount = 10): Promise<void> {
    const client = await this.db.collection.getClient();
    if (!client) {
      await _common.addDelay(1000);
      tryCount++;

      if (tryCount > maxTryCount) {
        throw new Error(UniAuthErrorMessages.MONGO_DB_CLIENT_UNAVAILABLE);
      }

      return this.ensureIndex(tryCount, maxTryCount);
    }

    const db = client.db(this.dbInfo.dbName);
    const col = db.collection(this.dbInfo.dbCollectionName);
    await col.createIndex({ [UniAuthTypes.EMAIL]: 1 }, { unique: true });
  }

  /**
   * Creates a middleware for authenticating requests
   */
  authRequest = (req: TReq, res: TRes, next: NextFunction) => {
    const middlewares = [setReqUniAuthObj.bind(this), authUserMw.bind(this)];
    const chain = middlewares.reduceRight(
      (nextFn: NextFunction, mw) => () => mw(req, res,  nextFn),
      next
    );
    chain();
  };
}

export default UniAuth;
