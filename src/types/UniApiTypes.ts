import { TNext, TReq, TRes } from "./express.js";
import { ICustomRoute } from "./UniRouterTypes.js";

export interface TServiceSettingsInput {
  idByKey?: string;
  strictSchema?: boolean;
  workspaceRequired?: boolean;
  userRequired?: boolean;
  workspaceToString_temp?: boolean;
}

export interface TServiceSettings {
  idByKey: string;
  strictSchema: boolean;
  workspaceRequired: boolean;
  userRequired: boolean;
  workspaceToString_temp: boolean;
}
type TMiddleware = (req: TReq, res: TRes, next: TNext) => void;
type TController = (req: TReq, res: TRes, next: TNext) => void;

interface TMethodAggregation {
  first?: [] | {};
  lookup?: [] | {};
  then?: [] | {};
  group?: [] | {};
}

interface TMethodCreate {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
  bodyCb?: Function;
  outputCb?: Function;
  requiredFields?: string[];
}

interface TMethodCreateMany {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
}

interface TMethodGet {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
  aggregations?: TMethodAggregation;
}

interface TMethodGetAll {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
  sort?: { default: string };
  filter?: { fields: string[] };
  queryCb?: Function;
  outputCb?: Function;
  search?: { fields: string[] };
  aggregations?: TMethodAggregation;
}

export type TMethodExport = {
  isActive: boolean;
  extensions?: Array<'csv' | 'xlsx'>;
  columns?: {
    key: string;
    title: string;
    valueCb?: Function;
  }[] | Function;
  dataCb?: Function;
  customSaver?: Function;
}

interface TMethodUpdate {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
  allowedFields?: string[];
  bodyCb?: Function;
  outputCb?: Function;
}

interface TMethodDelete {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
}

interface TMethodDeleteMany {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
}

interface TMethodDistinct {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
  fields: string[];
}

interface TMethodCustom extends ICustomRoute {}

export interface IUniApiInput {
  debug?: boolean;
  name: string;
  path?: string;
  model: Function;
  db: object;
  schema: object;
  serviceSettings?: TServiceSettingsInput;
  methods: {
    create?: TMethodCreate;
    createMany?: TMethodCreateMany;
    get?: TMethodGet;
    getAll?: TMethodGetAll;
    update?: TMethodUpdate;
    delete?: TMethodDelete;
    deleteMany?: TMethodDeleteMany;
    export?: TMethodExport;
    distinct?: TMethodDistinct;
    custom?: TMethodCustom[];
  };
}