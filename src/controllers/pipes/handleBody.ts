import _api from '../../utils/_api.js';
import ApiError from '../../utils/ApiError.js';
import { Request } from 'express';
import UniController from '../UniController.js';
import { ObjectId } from 'bson';

interface HandleBodyExtras {
  workspace?: string | ObjectId | null;
}

interface MethodSettings {
  bodyCb?: (body: Record<string, any>, req: Request) => Promise<Record<string, any>>;
  requiredFields?: string[];
  allowedFields?: string[];
}

interface Service {
  methods: Record<string, MethodSettings>;
  serviceSettings?: {
    workspaceRequired?: boolean;
  };
}

function filterBodyByRequiredFields(
  bodyInput: Record<string, any>,
  requiredFields?: string[]
): Record<string, any> {
  const hasRequiredFields = requiredFields && requiredFields.length;

  const output = hasRequiredFields
    ? _api.filterByAllowedKeys(bodyInput, [...requiredFields, 'workspace'])
    : bodyInput;

  return output;
}

async function handleBodyCreate(
  this: { service: Service },
  req: Request,
  METHOD_ID: string,
  extras: HandleBodyExtras
): Promise<Record<string, any>> {
  const { bodyCb, requiredFields } = this.service.methods[METHOD_ID];
  const bodyInput = { ...req.body };

  if (extras.workspace) {
    bodyInput.workspace = extras.workspace;
  }

  const output = filterBodyByRequiredFields(bodyInput, requiredFields);

  return output;
}

async function handleBodyUpdate(
  this: { service: Service; schema: { schema: Record<string, any> } },
  req: Request,
  METHOD_ID: string
): Promise<Record<string, any>> {
  const { schema } = this;
  const { bodyCb, allowedFields } = this.service.methods[METHOD_ID];

  const schemaKeys = Object.keys(schema.schema);
  const allowedUpdateKeys =
    allowedFields && allowedFields.length
      ? schemaKeys.filter((k) => allowedFields.includes(k))
      : schemaKeys;

  const bodyRaw = _api.filterByAllowedKeys(req.body, allowedUpdateKeys);

  if (Object.keys(req.body).length !== Object.keys(bodyRaw).length) {
    const keys = Object.keys(req.body).filter((k) => !(k in bodyRaw));
    throw new ApiError(400, 'Недопустимые ключи: ' + keys.join(', '));
  }

  const output = bodyRaw;

  return output;
}

async function handleBody(
  this: UniController,
  req: Request,
  METHOD_ID: string,
  extras: HandleBodyExtras
): Promise<Record<string, any>> {
  const { bodyCb, requiredFields, allowedFields } = this.service.methods[METHOD_ID];
  const hasBodyCb = bodyCb && typeof bodyCb === 'function';
  const { workspaceRequired } = this.service.serviceSettings || {};

  let output: Record<string, any> = {};

  if (METHOD_ID === 'create') {
    output = await handleBodyCreate.call(this, req, METHOD_ID, extras);
  } else if (METHOD_ID === 'update') {
    output = await handleBodyUpdate.call(this, req, METHOD_ID);
  }

  if (hasBodyCb) output = await bodyCb(output, req);

  return output;
}

export default handleBody;