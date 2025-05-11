import { Request, Response } from 'express';
import _api from '../../utils/_api.js';
import _validations from '../../utils/_validations.js';
import Pipes from '../pipes/index.js';
import UniController from '../UniController.js';
import { ApiActions } from '../../constants.js';

const METHOD_ID = ApiActions.CREATE;

async function createRecord(
  this: UniController,
  req: Request,
  res: Response
): Promise<void> {
  const methodOptions = this.service.methods[METHOD_ID];
  const { requiredFields } = methodOptions;
  const { schema, service, serviceSettings } = this;

  const { workspaceRequired } = serviceSettings;

  Pipes.validateReqPipe(req, METHOD_ID, { workspaceRequired });

  const { user, workspace } = Pipes.extractUser.call(this, req, METHOD_ID);
  const body = await Pipes.handleBody.call(this, req, METHOD_ID, { workspace });

  Pipes.validateBody.call(this, req, METHOD_ID, {
    body,
    schema,
    fields: requiredFields,
  });

  const createData = {
    data: { ...body },
    user: user,
  };

  const result = await service.create(createData);

  res.json({ ok: true, result });
}

export default createRecord;