import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import controllerDefaults from '../../defaults.js';
import Pipes from '../../pipes/index.js';
import parseCustomQuery from './parseCustomQuery.js';

import _api from '../../../utils/_api.js';
import _operators from '../../../utils/_operators.js';
import _validations from '../../../utils/_validations.js';
import UniController from '../../UniController.js';
import { ApiActions } from '../../../constants.js';

const METHOD_ID = ApiActions.GETALL;

interface Query {
  page?: string;
  perPage?: string;
  search?: string;
  sort?: string;
  debug?: string;
  expand?: string;
  pagination?: string;
  fields?: string;
  export?: string;
  [key: string]: any;
}

interface QueryParsed {
  page: number;
  perPage: number;
  search: string | null;
  sort: string | null;
  debug: boolean;
  exportTo: string | null;
  expand: boolean;
  pagination: boolean;
  fields: string[] | null;
  filters: Record<string, any>;
}

interface Service {
  methods: Record<string, any>;
  getAll: (params: Record<string, any>, exportTo?: string | null) => Promise<any>;
}

interface ServiceSettings {
  workspaceRequired?: boolean;
  workspaceToString_temp?: boolean;
}

const parseQuery = (query: Query): QueryParsed => {
  const {
    page,
    perPage,
    search,
    sort,
    debug,
    expand,
    pagination,
    fields,
} = query;

  const output: QueryParsed = {
    page: page && _api.checkStrIsNumber(page) ? Number(page) : controllerDefaults.page,
    perPage: perPage && _api.checkStrIsNumber(perPage) ? Number(perPage) : controllerDefaults.perPage,
    search: search || null,
    sort: sort || null,
    debug: debug !== undefined && _api.parseBoolean(debug),
    exportTo: query.export ? _api.getExport(query.export) : null,
    expand: expand !== undefined ? _api.parseBoolean(expand) : false,
    pagination: pagination !== undefined  ? _api.parseBoolean(pagination, true) : true,
    fields: _api.parseString(fields) || null,
    filters: {},
  };

  return output;
};

async function getAllRecords(
  this: UniController,
  req: Request,
  res: Response
): Promise<void> {
  Pipes.validateReqPipe(req, METHOD_ID);

  const { schema, service, serviceSettings } = this;

  const methodOptions = service.methods[METHOD_ID];
  const allowedFilters = service.methods.getAll?.filter?.fields || [];

  const queryCb = methodOptions?.queryCb || null;
  const isWorkspaceRequired = serviceSettings.workspaceRequired !== false;

  let { user, workspace } = Pipes.extractUser.call(this, req, METHOD_ID);

  // TEMP: Handle workspace as string or ObjectId
  const isWorkspaceToStringTemp = serviceSettings.workspaceToString_temp || false;
  if (isWorkspaceToStringTemp) {
    workspace = isWorkspaceToStringTemp !== true ? new ObjectId(workspace) : String(workspace);
  }

  const query = queryCb && typeof queryCb === 'function' ? await queryCb(req.query) : req.query;

  const queryRe = parseQuery(query);

  const customFilters = parseCustomQuery(schema, allowedFilters, query);

  const {
    page,
    perPage,
    sort,
    search,
    exportTo,
    pagination,
    debug,
    fields,
    expand,
    filters,
  } = queryRe;

  const filtersRe: Record<string, any> = {
    ...customFilters,
    ...filters,
  };

  if (isWorkspaceRequired) {
    filtersRe.workspace = workspace;
  }

  const params: {[key: string]: any} = {
    user,
    page,
    perPage,
    sort,
    search,
    filters: filtersRe,
    fields,
    expand,
    exportTo,
    pagination,
    debug,
  };

  if (isWorkspaceRequired) {
    params.workspace = workspace;
  }

  if (exportTo) {
    const paginationMax = { page: 1, perPage: 999999 };

    params.page = paginationMax.page;
    params.perPage = paginationMax.perPage;
  }

  const result = await service.getAll(params, exportTo || undefined);

  res.json({ ok: true, result });
}

export default getAllRecords;