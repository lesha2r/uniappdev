import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'bson';

import _api from '../../utils/_api.js';
import _validations from '../../utils/_validations.js';
import Pipes from '../pipes/index.js';
import ApiError from '../../utils/ApiError.js';
import { ApiActions } from '../../constants.js';

const METHOD_ID = ApiActions.CREATEMANY;

interface Schema {
  validate: (data: Record<string, any>, fields?: string[]) => { ok: boolean; errors?: string[] };
  schema: Record<string, any>;
}

interface Service {
  methods: Record<string, any>;
  createMany: (data: { data: Record<string, any>[]; user: any }) => Promise<any>;
}

interface ServiceSettings {
  workspaceRequired?: boolean;
  strictSchema?: boolean;
}

function validateData(
  data: Record<string, any>,
  schema: Schema,
  fields?: string[]
): { ok: boolean; errors?: string[] } {
  return Array.isArray(fields) && fields.length ? schema.validate(data, fields) : schema.validate(data);
}

function validateManyData(
  arr: Record<string, any>[],
  schema: Schema,
  fields?: string[]
): { record: Record<string, any>; result: { ok: boolean; errors?: string[] } }[] {
  const results: { record: Record<string, any>; result: { ok: boolean; errors?: string[] } }[] = [];
  const failedMessages: string[] = [];

  arr.forEach((record, i) => {
    const validation = validateData(record, schema, fields);

    if (validation.ok === false) {
      validation.errors?.forEach((e) => failedMessages.push(`${i}: ${e}`));
    }

    results.push({
      record,
      result: validation,
    });
  });

  if (failedMessages.length) {
    throw new ApiError(400, failedMessages.join('; '));
  }

  return results;
}

function handleEachRecords(
  arr: Record<string, any>[],
  fields?: string[],
  objToMerge: Record<string, any> = {}
): Record<string, any>[] {
  return arr.map((rec) => ({
    ..._api.filterByAllowedKeys(rec, fields || Object.keys(rec)),
    ...objToMerge,
  }));
}

async function applyBodyCallback(
  req: Request,
  bodyRaw: Record<string, any>[],
  bodyCb?: (item: Record<string, any>, req: Request) => Promise<Record<string, any>>
): Promise<Record<string, any>[]> {
  if (!bodyCb || typeof bodyCb !== 'function') return bodyRaw;

  const newBody: Record<string, any>[] = [];
  for (const item of bodyRaw) {
    newBody.push(await bodyCb(item, req));
  }

  return newBody;
}

async function handleBody(
    this: {service: Service; schema: Schema; serviceSettings?: ServiceSettings},
    req: Request,
    workspace: ObjectId | null
): Promise<Record<string, any>[]> {
  const { bodyCb, requiredFields } = this.service.methods['create'];
  const { schema, serviceSettings } = this;

  const objToMerge: Record<string, any> = {};
  if (serviceSettings?.workspaceRequired) {
    objToMerge.workspace = workspace;
  }

  const bodyRaw = handleEachRecords(req.body, requiredFields, objToMerge);
  let body = await applyBodyCallback(req, bodyRaw, bodyCb);

  if (serviceSettings?.strictSchema && schema && Object.keys(schema.schema).length) {
    body = body.map((item) => _api.filterByAllowedKeys(item, Object.keys(schema.schema)));
  }

  return body;
}

async function createManyRecords(
  this: { service: Service; schema: Schema; serviceSettings?: ServiceSettings },
  req: Request,
  res: Response,
): Promise<void> {
  Pipes.validateReqPipe(req, METHOD_ID);

  const {schema, service} = this;
  const {user, workspace} = Pipes.extractUser.call(this, req, METHOD_ID);
  const body = await handleBody.call(this, req, workspace);

  validateManyData(body, schema, this.service.methods['create'].requiredFields);

  const createManyData = {
    data: body,
    user,
  };

  const result = await service.createMany(createManyData);

  res.json({ ok: true, result });
}

export default createManyRecords;