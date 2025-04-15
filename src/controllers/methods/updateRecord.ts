import { Request, Response, NextFunction } from 'express';
import _api from '../../utils/_api.js';
import { ApiActions } from '../../constants.js';
import Pipes from '../pipes/index.js';
import UniController from '../UniController.js';
import _validations from '../../utils/_validations.js';

const METHOD_ID = ApiActions.UPDATE;

async function updateRecord(
  this: UniController,
  req: Request,
  res: Response,
): Promise<void> {
  Pipes.validateReqPipe(req, METHOD_ID);

  const methodOptions = this.service.methods[METHOD_ID];
  const { bodyCb, allowedFields } = methodOptions;
  const { schema, service, serviceSettings } = this;

  const idByKey = serviceSettings?.idByKey || '_id';
  const _id = req.params.id;

  const { user, workspace } = Pipes.extractUser.call(this, req, METHOD_ID);

  let body = await Pipes.handleBody.call(this, req, METHOD_ID, { workspace });

  if (serviceSettings?.strictSchema && schema && Object.keys(schema.schema).length) {
    body = _api.filterByAllowedKeys(body, Object.keys(schema.schema));
  }

  Pipes.validateBody.call(this, req, METHOD_ID, {
    body,
    schema,
    fields: Object.keys(body),
  });

  const updateData = {
    query: { workspace, [idByKey]: _id },
    data: { ...body },
    user: user,
  };

  const result = await service.update(updateData);

  res.json({ ok: true, result });
}

export default updateRecord;