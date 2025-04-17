import { NextFunction, Request, Response } from "express";
import UniController from "../../../controllers/UniController.js";
import ApiError from "../../../utils/ApiError.js";
import { TReq } from "../../../types/express.js";
import { UniAuthErrorMessages } from "../constants.js";

const guardUserIdMw = (req: TReq, res: Response, next: NextFunction) => {
  try {
    console.log("mw.guardUserIdMw");
    const userId = req.__uniAuth!.user._id ? req.__uniAuth?.user?._id.toString() : null;
    const paramsId = req.params?.id ? req.params?.id : undefined;

    if (paramsId !== userId) throw new ApiError(401, UniAuthErrorMessages.BAD_USER_ID);

    next();
  } catch (err) {
    UniController.resErr(err, req, res);
  }
};

export default guardUserIdMw;
