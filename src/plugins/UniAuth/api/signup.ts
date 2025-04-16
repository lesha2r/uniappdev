import Schema from 'validno';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../../../utils/ApiError.js';
import { NextFunction, Request, Response } from 'express';
import { TUniAuth } from '../index.js';
import { HttpMethods } from '../../../constants.js';
import { ICustomRoute } from '../../../types/UniRouterTypes.js';
import _validations from '../../../utils/_validations.js';
import signinService from '../services/signinService.js';
import _api from '../../../utils/_api.js';
import { UniAuthErrorMessages } from '../constants.js';

const validateReqBody = (schema: typeof Schema, body: {[key: string]: any}) => {
  if (!_validations.isObject(body)) throw new ApiError(400, 'Missing body or it is incorrect')
    console.log(schema)
  const result = schema.validate(body);
  if (result.ok !== true) throw new ApiError(400, result.joinErrors());
};

function signupController(uniAuthOptions: TUniAuth): ICustomRoute {
  return {
    path: 'signup',
    method: HttpMethods.POST,
    controller: async function(this: TUniAuth, req: Request, res: Response, next: NextFunction) {
      const userSchema = uniAuthOptions.models.userSchema
      
      const body = req.body
      validateReqBody(userSchema, body);

      const timestamp = new Date()
      const {email, password, name} = body;
      const passwordCrypted = await bcrypt.hash(password, 10);

      // @ts-ignore
      const user = await new uniAuthOptions.models.UserModel().init({
        email,
        password: passwordCrypted,
        name,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      await user.insert()

      const {session, tokens, ok} = await signinService(uniAuthOptions, {email, password})
      if (!ok) throw new ApiError(500, UniAuthErrorMessages.FAILED_TO_SIGNIN_DURING_SIGNUP)

      const userData = user.data()

      const response = {
        ok: true,
        user: _api.filterByAllowedKeys(userData, [...Object.keys(userData).filter((key) => key !== 'password')]),
        tokens: tokens,
        session: session,
      }

      res.json(response);
    },
    middlewares: [],
  };
}

export default signupController;
