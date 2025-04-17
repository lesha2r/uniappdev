import { NextFunction } from "express";
import UniController from "../../../controllers/UniController.js";
import { TReq, TRes } from "../../../types/express.js";
import { TUniAuth } from "../index.js";

function setReqUniAuthObj (this: TUniAuth, req: TReq, res: TRes, next: NextFunction) {
  try {
    console.log('mw.setReqUniAuthObj');
    if ('__uniAuth' in req) return next();

    req.__uniAuth = {
      authed: false,
      user: {
        _id: '',
        email: '',
        workspace: '',
        session: '',
        tokens: {
          access: ''
        }
      },
    };

    next();
  } catch (err) {
    UniController.resErr(err, req, res);
  }
};

export default setReqUniAuthObj;