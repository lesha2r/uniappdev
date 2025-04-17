/* eslint-disable no-invalid-this */
/* eslint-disable require-jsdoc */
/* eslint-disable jsdoc/require-jsdoc */
import UniApi from '../../../UniApi.js'
import signinController from './signin.js';
import signupController from './signup.js';
import signoutController from './signout.js';
import refreshController from './refresh.js';
import { TUniAuth } from '../index.js';
import { IUniApiInput } from '../../../types/UniApiTypes.js';
import verifyController from './verify.js';

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

  const customControllers = options.allowedActions.map((action) => {
    switch (action) {
      case 'signin':
        return signinController(options);
      case 'signup':
        return signupController(options);
      case 'signout':
        return signoutController(options);
      case 'refresh':
        return refreshController(options);
      case 'verify':
        return verifyController(options);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  })

  const apiConfig: IUniApiInput = {
    name: options.name,
    model: options.models.UserModel,
    db: options.db.collection,
    schema: options.models.userSchema,
    methods: {
      custom: customControllers,
    },
  };

  return new UniApi(apiConfig);
}

export default buildAuthApi;
