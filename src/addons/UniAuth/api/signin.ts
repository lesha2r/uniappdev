import { NextFunction, Request, Response } from 'express';
import { TUniAuth } from '../index.js';
import { HttpMethods } from '../../../constants.js';
import { ICustomRoute } from '../../../types/UniRouterTypes.js';
import signinService from '../services/signinService.js';

function signinController(uniAuthOptions: TUniAuth): ICustomRoute {
  return {
    path: 'signin',
    method: HttpMethods.POST,
    controller: async function(req: Request, res: Response, next: NextFunction) {
      const response = await signinService(uniAuthOptions, req.body);
      res.json(response);
    },
  };
}

export default signinController;
