/* eslint-disable no-invalid-this */
/* eslint-disable require-jsdoc */
/* eslint-disable jsdoc/require-jsdoc */
import UniApi from '../../../UniApi.js'
import middlewares from '../middlewares/index.js';
import bcrypt from 'bcrypt';
import signinController from './signin.js';
import signupController from './signup.js';
import signoutController from './signout.js';
import refreshController from './refresh.js';
import { TUniAuth } from '../index.js';
import { IUniApiInput } from '../../../types/UniApiTypes.js';

function buildAuthApi(options: TUniAuth) {
  if (!options) {
    throw new Error('UniAuth options are not provided');
  }

  if (!options.db) {
    throw new Error('UniAuth db is not provided');
  }

  if (!options.db.collection || !options.db.tokensCollection) {
    throw new Error('UniAuth db collection or tokensCollection is not provided');
  }

  const apiConfig: IUniApiInput = {
    name: options.name,
    model: options.models.UserModel,
    db: options.db.collection,
    schema: options.models.userSchema,
    methods: {
      getAll: {
        isActive: true,
        middlewares: [
          middlewares.setReqUniAuthObj,
          middlewares.testMw,
          middlewares.authUserMw,
        ],
        filter: {
          fields: [
            '_id',
          ],
        },
        queryCb(input = {}) {
          return {...input, _id: '67d5ed1314348bbbe3df44e7'};
        },
      },
      get: {
        isActive: true,
        middlewares: [
          middlewares.setReqUniAuthObj,
          middlewares.testMw,
          middlewares.authUserMw,
          middlewares.guardUserIdMw,
        ],
      },
      create: {
        isActive: true,
        middlewares: [
          middlewares.setReqUniAuthObj,
          middlewares.testMw,
        ],
        async bodyCb(body: {[key: string]: any}) {
          const passwordHashed = await bcrypt.hash(body.password, 10);

          return {
            ...body,
            password: passwordHashed,
          };
        },
        outputCb(data: {[key: string]: any}) {
          return {
            ...data,
            password: '*'.repeat(24),
          };
        },
      },
      update: {
        isActive: true,
        middlewares: [
          middlewares.setReqUniAuthObj,
          middlewares.testMw,
          middlewares.authUserMw,
        ],
        allowedFields: ['password', 'name'],
        async bodyCb(body: {[key: string]: any}) {
          if (body.password) {
            const bodyRe = {...body};

            const passwordHashed = await bcrypt.hash(body.password, 10);
            bodyRe.password = passwordHashed;

            return bodyRe;
          }

          return {
            ...body,
          };
        },
        outputCb(data: {[key: string]: any}) {
          return {
            ...data,
            password: '*'.repeat(24),
          };
        },
      },
      custom: [
        signinController(options),
        signupController(options),
        signoutController(options),
        refreshController(options),
      ],
    },
  };

  return new UniApi(apiConfig);
}

export default buildAuthApi;
