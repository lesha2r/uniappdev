import Schema from 'validno';
import UniController from './controllers/UniController.js';
import UniRouter from './router/UniRouter.js';
import UniService from './service/UniService.js';
import _constructor from './utils/_constructor.js';
import config from './config.js';
import { BaseMethods } from './config.js'; // Import the BaseMethods enum

interface TServiceSettingsInput {
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

interface TReqCustom {
  user: any;
}

type TReq = import('express').Request & TReqCustom;
type TRes = import('express').Response;
type TNext = import('express').NextFunction;

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

interface TExportColumn {
  key: string;
  title: string;
  valueCb?: Function;
}

export type TMethodExport = {
  isActive: boolean;
  extensions?: Array<'csv' | 'xlsx'>;
  columns?: TExportColumn[] | Function;
  dataCb?: Function;
  customSaver?: Function;
}

interface TMethodUpdate {
  isActive: boolean;
  middlewares?: TMiddleware | TMiddleware[];
  allowedFields?: string[];
  bodyCb?: Function;
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

interface TMethodCustom {
  name?: string;
  path: string;
  method: keyof typeof BaseMethods; // Restrict to keys of the BaseMethods enum
  middlewares?: TMiddleware | TMiddleware[];
  controller: TController;
}

export type TConfig = {
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

const validateConfig = (cfg: TConfig) => {
  const cfgSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    model: {
      type: 'any',
      required: true,
      rules: {
        custom: (Model: any) => {
          const output = { result: false, details: 'Проверьте модель' };

          try {
            const prod = new Model();
            const isOk = prod.constructor.name === 'InstanceModel';
            output.result = isOk;
            output.details = isOk ? '' : 'Модель (model) имеет неверный тип';
          } catch {
            output.result = false;
            output.details = 'Модель (model) имеет неверный тип';
          }

          return output;
        },
      },
    },
    db: {
      type: 'any',
      required: true,
      rules: {
        custom: (dbController: any) => {
          const output = { result: false, details: 'Проверьте объект контроллера коллекции БД' };

          try {
            const isOk = dbController.constructor.name === 'MongoController';
            output.result = isOk;
            output.details = isOk ? '' : 'db имеет неверный тип';
          } catch {
            output.result = false;
            output.details = 'db имеет неверный тип';
          }
          return output;
        },
      },
    },
    schema: {
      type: 'any',
      required: true,
      rules: {
        custom: (dbController: any) => {
          const output = { result: false, details: 'Проверьте объект контроллера коллекции БД' };

          try {
            const isOk = dbController.constructor.name === 'Schema';
            output.result = isOk;
            output.details = isOk ? '' : 'schema имеет неверный тип';
          } catch {
            output.result = false;
            output.details = 'schema имеет неверный тип';
          }
          return output;
        },
      },
    },
    methods: {
      create: {
        type: Object,
        required: false,
      },
      createMany: {
        type: Object,
        required: false,
      },
      get: {
        type: Object,
        required: false,
      },
      getAll: {
        type: Object,
        required: false,
      },
      update: {
        type: Object,
        required: false,
      },
      delete: {
        type: Object,
        required: false,
      },
      deleteMany: {
        type: Object,
        required: false,
      },
      export: {
        type: Object,
        required: false,
      },
      distinct: {
        type: Object,
        required: false,
      },
      custom: {
        type: Array,
        required: false,
        rules: {
          custom: (arr: any[]) => {
            const errors: string[] = [];
            const result = arr.every((item) => {
              const pathOk = 'path' in item && typeof item.path === 'string';
              const methodOk = 'method' in item && ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'].includes(item.method.toUpperCase());
              const mwOk = ('middlewares' in item === false) || (typeof item.middlewares === 'function' || Array.isArray(item.middlewares));
              const ctrlOk = 'controller' in item && typeof item.controller === 'function';

              if (!pathOk) errors.push('path');
              if (!methodOk) errors.push('method');
              if (!mwOk) errors.push('middlewares');
              if (!ctrlOk) errors.push('controller');

              return pathOk && methodOk && mwOk && ctrlOk;
            });

            return {
              result,
              details: result ?
                '' :
                'Проверьте корректность конфигурации метода custom: ' + errors.join(', '),
            };
          },
        },
      },
    },
  });

  const res = cfgSchema.validate(cfg);

  if (res.ok !== true) {
    const errorsMsg = res.errors.join('; ');
    throw new Error(errorsMsg);
  }
};

const handleMethods = (methods: TConfig['methods']) => {
  const output = { ...methods, custom: methods?.custom || [] } as TConfig['methods'];

  for (const key of Object.keys(output) as Array<keyof TConfig['methods']>) {
    const keyUppercase = String(key).toUpperCase();

    if (key === config.baseMethods.CUSTOM) {
      if (!Array.isArray(output.custom)) {
        throw new Error('Метод custom должен быть массивом');
      }
      output['custom'].forEach((e: any) => (e.routerMethod = e.method))
    } else if (typeof output[key] === 'object' && output[key] !== null) {
      (output[key] as any).routerMethod = config.baseMethodsRoutes[keyUppercase as keyof typeof config.baseMethodsRoutes];
    }
  }

  return output;
};

const getServiceSettingsDefaults = (passedSettings: TServiceSettingsInput | null): TServiceSettings => {
  const defaults: TServiceSettings = {
    idByKey: '_id',
    strictSchema: false,
    workspaceRequired: false,
    userRequired: false,
    workspaceToString_temp: false,
  };

  if (!passedSettings) return defaults;

  for (const key of Object.keys(passedSettings)) {
    if (key in defaults) {
      (defaults as any)[key as keyof TServiceSettings] = passedSettings[key as keyof TServiceSettingsInput];
    }
  }

  return defaults;
};

class UniApi {
  debug: boolean;
  name: string;
  path: string;
  Model: Function;
  db: object;
  schema: object;
  methods: TConfig['methods'];
  serviceSettings: TServiceSettings;
  methodsAllowed: any;
  service: UniService;
  controller: UniController;
  router: UniRouter;

  constructor(inputCfg: TConfig) {
    validateConfig(inputCfg);

    this.debug = inputCfg.debug || false;
    this.name = inputCfg.name;
    this.path = inputCfg.path || inputCfg.name;
    this.Model = inputCfg.model;
    this.db = inputCfg.db;
    this.schema = inputCfg.schema;
    this.methods = handleMethods(inputCfg.methods);
    this.serviceSettings = getServiceSettingsDefaults(inputCfg.serviceSettings || null);

    if (this.debug) {
      console.log(this.serviceSettings);
    }

    this.methodsAllowed = _constructor.getAllowedMethods(this.methods);

    this.service = new UniService({
      name: this.name,
      Model: this.Model,
      db: this.db,
      schema: this.schema,
      serviceSettings: this.serviceSettings,
      methods: this.methods,
      methodsAllowed: this.methodsAllowed,
    });

    this.controller = new UniController({
      service: this.service,
      serviceSettings: this.serviceSettings,
      methodsAllowed: this.methodsAllowed,
    });

    this.router = new UniRouter({
      path: this.path,
      serviceSettings: this.serviceSettings,
      methods: this.methods,
      methodsAllowed: this.methodsAllowed,
      controller: this.controller,
    });
  }

  refreshMethodsAllowed() {
    this.methodsAllowed = _constructor.getAllowedMethods(this.methods);
    this.service.refreshMethodsAllowed(this.methods);
    this.controller.refreshMethodsAllowed(this.methods);
    this.router.refreshMethodsAllowed(this.methods);
  }
}

export default UniApi;
