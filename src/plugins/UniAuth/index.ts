/* eslint-disable require-jsdoc */

import mongomod from 'mongomod';
import userSchema, {userMongoSchema} from './schemas/userSchema.js';
import tokenSchema, {tokenMongoSchema} from './schemas/tokenSchema.js';
import buildAuthApi from './api/index.js';
import config from './config.js';
import _common from '../../utils/_common.js';
import { UniAuthErrorMessages } from './constants.js';
import authUserMw from './middlewares/authUserMw.js';
import { TReq, TRes } from '../../types/express.js';
import { NextFunction } from 'express';
import setReqUniAuthObj from './middlewares/setReqUniAuthObj.js';
import { ApiActions, AuthActions } from '../../constants.js';

const COL_NAME_PREFIX_TOKENS = '_tokens';

interface AuthCreateInput {
  name: string;
  dbCredentials: DbCredentials;
  dbName: string;
  dbCollection?: string;
  dbTokensCollection?: string;
  type: string;
  jwtConfig: AuthCreateInputJWT;
  allowedActions: AuthActions[]
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
    connection: {connect(): void},  //mongomod.Connection;
    collection: object | null;
    tokensCollection: object | null;
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
    connection: { connect(): void };
    collection: object | null;
    tokensCollection: object | null;
  };
  models: Models;
  allowedActions: AuthActions[];
  api: any;

  constructor(authCreateInput: AuthCreateInput) {
    this.name = authCreateInput.name || config.authNameDefault;
    this.type = authCreateInput.type || config.authTypeDefault;
    this.jwtConfig = {
      accessTokenSecret: authCreateInput.jwtConfig.accessSecret,
      refreshTokenSecret: authCreateInput.jwtConfig.refreshSecret,
      accTokenLiveTime: authCreateInput.jwtConfig.accessLiveTime || config.jwtDefaults.accessToken.expiresIn,
      refTokenLiveTime: authCreateInput.jwtConfig.refreshLiveTime || config.jwtDefaults.refreshToken.expiresIn,
    };

    this.dbInfo = {
      dbName: authCreateInput.dbCredentials.dbName,
      dbCollectionName: authCreateInput.dbCredentials.collection || authCreateInput.name,
      dbTokensCollectionName:
        authCreateInput.dbCredentials.tokensCollection || authCreateInput.name + COL_NAME_PREFIX_TOKENS,
    };

    this.db = {
      connection: new mongomod.Connection({
        link: authCreateInput.dbCredentials.link,
        login: authCreateInput.dbCredentials.login,
        password: authCreateInput.dbCredentials.password,
        dbName: authCreateInput.dbCredentials.dbName,
        debug: authCreateInput.dbCredentials.debug,
        srv: authCreateInput.dbCredentials.srv,
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

    this.allowedActions = authCreateInput.allowedActions || Object.values(AuthActions)

    this.ensureIndex()
    this.api = buildAuthApi(this);
  }

  async ensureIndex(tryCount = 0, maxTryCount = 10): Promise<void> {
    // @ts-ignore
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
    await col.createIndex({ email: 1 }, { unique: true });
  }

  authRequest() {
    return (req: TReq, res: TRes, next: NextFunction) => {
      const callNext = () => {
        console.log('MW: callNext')
        next()
      }

      const mws = [setReqUniAuthObj, authUserMw, callNext]
      
      const callNextByIndex = (i: number, middlewares: Function[]) => {
        if (i >= middlewares.length) return;
        const mw = middlewares[i];

        mw.call(this, req, res, () => {
          callNextByIndex(i + 1, middlewares);
        });
      }

      callNextByIndex(0, mws);
    }
  }
}

export default UniAuth;
