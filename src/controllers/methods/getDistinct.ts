import { Request, Response } from 'express';
import _api from '../../utils/_api.js';
import { ApiActions } from '../../constants.js';
import Pipes from '../pipes/index.js';
import UniController from '../UniController.js';

const METHOD_ID = ApiActions.DISTINCT;

interface QueryParsed {
  fields: string[] | undefined;
}

function parseQuery(query: Record<string, any>): QueryParsed {
  return {
    fields: _api.parseString(query.fields),
  };
}

async function getDistinct(
  this: UniController,
  req: Request,
  res: Response
): Promise<void> {
  Pipes.validateReqPipe(req, METHOD_ID);

  const methodOptions = this.service.methods[METHOD_ID];
  const fieldsAllowed = methodOptions.fields;

  const { user, workspace } = Pipes.extractUser.call(this, req, METHOD_ID);

  const queryParsed = parseQuery(req.query);
  const { fields } = queryParsed;

  const query = { workspace };

  const result = await this.service.distinct({
    user: req.user,
    query,
    fields,
  });

  res.json({ ok: true, result });
}

export default getDistinct;