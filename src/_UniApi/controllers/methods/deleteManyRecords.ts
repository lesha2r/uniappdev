import { Request, Response, NextFunction } from 'express';
import _api from '../../utils/_api.js';
import config from '../../config.js';
import Pipes from '../pipes/index.js';
import UniController from '../UniController.js';
import _validations from '../../utils/_validations.js';

const METHOD_ID = config.baseMethods.DELETEMANY;

async function deleteManyRecords(
  this: UniController,
  req: Request,
  res: Response,
): Promise<void> {
  Pipes.validateReqPipe(req, METHOD_ID);

  const methodOptions = this.service.methods[METHOD_ID];
  const { service, serviceSettings } = this;
  const idByKey = serviceSettings.idByKey;

  const { user, workspace } = Pipes.extractUser.call(this, req, METHOD_ID);

  const ids = req.body?.ids;

  const deleteData = {
    queries: [],
    user: user,
    idByKey,
  };

  deleteData.queries = ids.map((id: string) => {
    const output: Record<string, any> = {
      [idByKey]: id,
    };

    if (serviceSettings.workspaceRequired) {
      output.workspace = workspace;
    }

    return output;
  });

  const result = await service.deleteMany(deleteData);

  res.json({ ok: true, result });
}

export default deleteManyRecords;