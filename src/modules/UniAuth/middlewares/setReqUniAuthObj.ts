import { NextFunction } from "express";
import UniController from "../../../controllers/UniController.js";
import { TReq, TRes } from "../../../types/express.js";

const setReqUniAuthObj = (req: TReq, res: TRes, next: NextFunction) => {
  try {
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