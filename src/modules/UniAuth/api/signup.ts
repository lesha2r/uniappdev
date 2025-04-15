import Schema from 'validno';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../../../utils/ApiError.js';
import { NextFunction, Request, Response } from 'express';
import { TUniAuth } from '../index.js';
import { HttpMethods } from '../../../constants.js';
import { ICustomRoute } from '../../../types/UniRouterTypes.js';

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

function signupController(uniAuthOptions: TUniAuth): ICustomRoute {
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


      const response = {
        ok: true,
        tokens: {
          access: '',
          refresh: 'refreshToken',
        },
        session: '',
      };

      res.json(response);
    },
    middlewares: [],
  };
}

export default signupController;
