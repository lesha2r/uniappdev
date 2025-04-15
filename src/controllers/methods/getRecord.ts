import { Request, Response, NextFunction } from 'express';
import { ApiActions } from '../../constants.js';
import Pipes from '../pipes/index.js';
import UniController from '../UniController.js';

const METHOD_ID = ApiActions.GET;

async function getRecord(
  this: UniController,
  req: Request,
  res: Response,
): Promise<void> {
  Pipes.validateReqPipe(req, METHOD_ID);

  const methodOptions = this.service.methods[METHOD_ID];
  const { service, serviceSettings } = this;

  const idByKey = serviceSettings?.idByKey || '_id';

  const _id = req.params.id;
  const { user, workspace } = Pipes.extractUser.call(this, req, METHOD_ID);

  const getQuery = {
    query: { workspace, [idByKey]: _id },
    user: user,
  };

  const result = await service.get(getQuery);

  res.json({ ok: true, result });
}

export default getRecord;