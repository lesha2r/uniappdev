import { NextFunction, Response } from 'express';
import middlewares from '../middlewares/index.js';
import { TUniAuth } from '../index.js';
import { HttpMethods } from '../../../constants.js';
import { TReqAuthed, TRes } from '../../../types/express.js';
import { ICustomRoute } from '../../../types/UniRouterTypes.js';

function signoutController(uniAuthOptions: TUniAuth): ICustomRoute {
  return {
    path: 'signout',
    method: HttpMethods.POST,
    middlewares: [
      (...args) => middlewares.setReqUniAuthObj.call(uniAuthOptions, ...args),
      (...args) => middlewares.authUserMw.call(uniAuthOptions, ...args),
    ],
    controller: async function(req: TReqAuthed, res: TRes, next: NextFunction) {
      const user = req.__uniAuth.user;
      const isMultiple = req.query?.multiple === 'true';

      const removeQuery: { query: { user: string; session?: string } } = {
        query: {
          user: user._id,
          session: user.session,
        },
      };

      if (isMultiple) delete removeQuery.query.session;

      // @ts-ignore
      await uniAuthOptions.db.tokensCollection.deleteMany(removeQuery);

      res.json({ok: true});
    },
  };
}

export default signoutController;
