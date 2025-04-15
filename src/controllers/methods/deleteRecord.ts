import { Request, Response } from 'express';
import _api from '../../utils/_api.js';
import { ApiActions } from '../../constants.js';
import Pipes from '../pipes/index.js';
import UniController from '../UniController.js';
import _validations from '../../utils/_validations.js';

const METHOD_ID = ApiActions.DELETE;

async function deleteRecord(
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

  const deleteData: {query: {[key: string]: any}, user: any} = {
    query: { [idByKey]: _id },
    user: req.user,
  };

  if (serviceSettings?.workspaceRequired) {
    deleteData.query.workspace = workspace;
  }

  const result = await service.delete(deleteData);

  res.json({ ok: true, result });
}

export default deleteRecord;