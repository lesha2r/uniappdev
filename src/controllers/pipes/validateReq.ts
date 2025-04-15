import { Request } from 'express';

interface CustomUser {
  _id?: string;
  ws?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: CustomUser;
  }
}
import _validations from '../../utils/_validations.js';
import controllerDefaults from '../defaults.js';
import ApiError from '../../utils/ApiError.js';

interface ValidateOptions {
  workspaceRequired?: boolean;
}

const ERROR_MESSAGES = {
  MISSING_USER: 'Отсутствует данные пользователя',
  MISSING_WORKSPACE: 'Отсутствует _id воркспейса',
  INVALID_BODY_ARRAY: 'Некорректный запрос: body (Array)',
  INVALID_BODY_OBJECT: 'Некорректный запрос: body',
  MISSING_ID: 'Отсутствует _id записи',
  INVALID_MULTIPLE: 'Параметр multiple должен быть равен "true"',
  INVALID_BODY_IDS: 'Некорректный формат body или отсутствует массив ids',
  INVALID_ID_IN_BODY: 'Метод не допускает установку/изменение _id',
  MISSING_FIELDS: 'Необходимо указать fields',
  INVALID_PAGE: 'Некорректные параметры запроса: page',
  INVALID_PER_PAGE: 'Некорректные параметры запроса: perPage',
  INVALID_SORT: 'Некорректные параметры запроса: sort',
  MISSING_PATTERN: 'Отсутствует значение pattern',
  UNSUPPORTED_PATTERN: 'Отсутствует обработка для',
};

const hasUser = (req: Request): true | string => {
  return !req.user || !req.user._id ? ERROR_MESSAGES.MISSING_USER : true;
};

const hasWorkspace = (req: Request): true | string => {
  return !req.user?.ws ? ERROR_MESSAGES.MISSING_WORKSPACE : true;
};

const bodyForManyIsArray = (req: Request): true | string => {
  return !_validations.isArray(req.body) || !req.body.length
    ? ERROR_MESSAGES.INVALID_BODY_ARRAY
    : true;
};

const hasBodyObj = (req: Request): true | string => {
  return !_validations.isObject(req.body) || !Object.keys(req.body).length
    ? ERROR_MESSAGES.INVALID_BODY_OBJECT
    : true;
};

const hasParamId = (req: Request): true | string => {
  return !req.params.id ? ERROR_MESSAGES.MISSING_ID : true;
};

const hasMultipleTrue = (req: Request): true | string => {
  return req.query.multiple !== 'true' ? ERROR_MESSAGES.INVALID_MULTIPLE : true;
};

const hasBodyWithIds = (req: Request): true | string => {
  return !req.body?.ids?.length ? ERROR_MESSAGES.INVALID_BODY_IDS : true;
};

const hasNoIdInBody = (req: Request): true | string => {
  return req.body && '_id' in req.body ? ERROR_MESSAGES.INVALID_ID_IN_BODY : true;
};

const hasFieldsKey = (req: Request): true | string => {
  return !req.query.fields ? ERROR_MESSAGES.MISSING_FIELDS : true;
};

const validateWorkspaceAndUser = (req: Request, workspaceRequired?: boolean): string[] => {
  const errors: (true | string)[] = [];

  if (workspaceRequired) {
    errors.push(hasWorkspace(req));
    errors.push(hasUser(req));
  }

  return errors.filter((e): e is string => e !== true);
};

const validateReqCreate = (req: Request, options?: ValidateOptions): true | never => {
  const { workspaceRequired } = options || {};

  const errors = [
    hasBodyObj(req),
    hasNoIdInBody(req),
    ...validateWorkspaceAndUser(req, workspaceRequired),
  ];

  const result = errors.filter((e): e is string => e !== true);
  if (!result.length) return true;

  throw new ApiError(400, result.join('; '));
};

const validateReqCreateMany = (req: Request): true | never => {
  const errors = [bodyForManyIsArray(req)];

  const result = errors.filter((e): e is string => e !== true);
  if (!result.length) return true;

  throw new ApiError(400, result.join('; '));
};

const validateReqGet = (req: Request, options?: ValidateOptions): true | never => {
  const { workspaceRequired } = options || {};

  const errors = [hasParamId(req), ...validateWorkspaceAndUser(req, workspaceRequired)];

  const result = errors.filter((e): e is string => e !== true);
  if (!result.length) return true;

  throw new ApiError(400, result.join('; '));
};

const validateReqGetAll = (req: Request): true | never => {
  const { page, perPage, sort } = req.query;
  const pageRe = /^\d+$/.test(page as string) ? Number(page) : controllerDefaults.page;
  const perPageRe = /^\d+$/.test(perPage as string) ? Number(perPage) : controllerDefaults.perPage;

  const errors: string[] = [];

  if (sort === '') {
    errors.push(ERROR_MESSAGES.INVALID_SORT);
  }

  if (typeof pageRe !== 'number' || pageRe < 1) {
    errors.push(ERROR_MESSAGES.INVALID_PAGE);
  }

  if (typeof perPageRe !== 'number' || perPageRe < 1) {
    errors.push(ERROR_MESSAGES.INVALID_PER_PAGE);
  }

  if (errors.length) {
    throw new ApiError(400, errors.join(', '));
  }

  return true;
};

const validateReqDelete = (req: Request, options?: ValidateOptions): true | never => {
  const { workspaceRequired } = options || {};

  const errors = [hasParamId(req), ...validateWorkspaceAndUser(req, workspaceRequired)];

  const result = errors.filter((e): e is string => e !== true);
  if (!result.length) return true;

  throw new ApiError(400, result.join('; '));
};

const validateReqDeleteMany = (req: Request, options?: ValidateOptions): true | never => {
  const { workspaceRequired } = options || {};

  const errors = [
    hasMultipleTrue(req),
    hasBodyWithIds(req),
    ...validateWorkspaceAndUser(req, workspaceRequired),
  ];

  const result = errors.filter((e): e is string => e !== true);
  if (!result.length) return true;

  throw new ApiError(400, result.join('; '));
};

const validateReqDistinct = (req: Request, options?: ValidateOptions): true | never => {
  const { workspaceRequired } = options || {};

  const errors = [hasFieldsKey(req), ...validateWorkspaceAndUser(req, workspaceRequired)];

  const result = errors.filter((e): e is string => e !== true);
  if (!result.length) return true;

  throw new ApiError(400, result.join('; '));
};

const validateReqUpdate = (req: Request, options?: ValidateOptions): true | never => {
  const { workspaceRequired } = options || {};

  const errors = [
    hasBodyObj(req),
    hasNoIdInBody(req),
    ...validateWorkspaceAndUser(req, workspaceRequired),
  ];

  const result = errors.filter((e): e is string => e !== true);
  if (!result.length) return true;

  throw new ApiError(400, result.join('; '));
};

const validateReq = (
  req: Request,
  pattern: string,
  options?: ValidateOptions
): true | never => {
  if (!pattern) throw new Error(ERROR_MESSAGES.MISSING_PATTERN);

  switch (pattern) {
    case 'create':
      return validateReqCreate(req, options);
    case 'createMany':
      return validateReqCreateMany(req);
    case 'get':
      return validateReqGet(req, options);
    case 'getAll':
      return validateReqGetAll(req);
    case 'delete':
      return validateReqDelete(req, options);
    case 'deleteMany':
      return validateReqDeleteMany(req, options);
    case 'distinct':
      return validateReqDistinct(req, options);
    case 'update':
      return validateReqUpdate(req, options);
    default:
      throw new Error(`${ERROR_MESSAGES.UNSUPPORTED_PATTERN} "${pattern}"`);
  }
};

export default validateReq;