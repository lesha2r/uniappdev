/* eslint-disable require-jsdoc */

import mongomod from 'mongomod';
import userSchema, {userMongoSchema} from './schemas/userSchema.js';
import tokenSchema, {tokenMongoSchema} from './schemas/tokenSchema.js';
import buildAuthApi from './api/index.js';

const COL_NAME_PREFIX_TOKENS = '_tokens';

interface AuthCreateInput {
  name: string;
  dbCredentials: DbCredentials;
  dbName: string;
  dbCollection?: string;
  dbTokensCollection?: string;
  type: string;
  jwtConfig: AuthCreateInputJWT;
}

interface AuthCreateInputJWT {
  accessSecret: string;
  refreshSecret: string;
  accessLiveTime?: string;
  refreshLiveTime?: string;
}

interface JwtConfiguration {
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
  api: any;

  constructor(authCreateInput: AuthCreateInput) {
    this.name = authCreateInput.name;
    this.type = authCreateInput.type;
    this.jwtConfig = {
      accessTokenSecret: authCreateInput.jwtConfig.accessSecret,
      refreshTokenSecret: authCreateInput.jwtConfig.refreshSecret,
      accTokenLiveTime: authCreateInput.jwtConfig.accessLiveTime || '60m',
      refTokenLiveTime: authCreateInput.jwtConfig.refreshLiveTime || '1m',
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

    this.api = buildAuthApi(this);
  }
}

export default UniAuth;
