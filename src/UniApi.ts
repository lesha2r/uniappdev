import Schema from 'validno';
import UniController from './controllers/UniController.js';
import UniRouter from './router/UniRouter.js';
import UniService from './service/UniService.js';
import _constructor from './utils/_constructor.js';
import { IUniApiInput, TServiceSettings, TServiceSettingsInput } from './types/UniApiTypes.js';
import { ApiActions, ApiActionsMethods, HttpMethods } from './constants.js';

const methodKeys = [
  ...Object.keys(ApiActions)
];

const methods = methodKeys.reduce((acc: Record<string, { type: 'any'; required: boolean }>, key) => {
  acc[key] = { type: 'any', required: false };
  return acc;
}, {} as Record<string, { type: 'any'; required: true }>);

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
    ...methods,
    custom: {
      type: Array,
      required: false,
      rules: {
        custom: (arr: any[]) => {
          const errors: string[] = [];
          const result = arr.every((item) => {
            const pathOk = 'path' in item && typeof item.path === 'string';
            const methodOk = 'method' in item && [HttpMethods.POST, HttpMethods.GET, HttpMethods.PATCH, HttpMethods.PUT, HttpMethods.DELETE].includes(item.method.toLowerCase());
            const mwOk = ('middlewares' in item === false) || (typeof item.middlewares === 'function' || Array.isArray(item.middlewares));
            const ctrlOk = 'controller' in item && typeof item.controller === 'function';

            if (!pathOk) errors.push('path');
            if (!methodOk) errors.push('method ' + item.method);
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

const validateConfig = (cfg: IUniApiInput, schema: InstanceType<typeof Schema>) => {
  const res = cfgSchema.validate(cfg);

  if (res.ok !== true) {
    const errorsMsg = res.errors.join('; ');
    throw new Error(errorsMsg);
  }
};

const handleMethods = (methods: IUniApiInput['methods']) => {
  const output = { ...methods, custom: methods?.custom || [] } as IUniApiInput['methods'];

  for (const key of Object.keys(output) as Array<keyof IUniApiInput['methods']>) {
    const keyUppercase = String(key).toUpperCase();

    if (key === ApiActions.CUSTOM) {
      if (!Array.isArray(output.custom)) {
        throw new Error('Метод custom должен быть массивом');
      }
      output['custom'].forEach((e: any) => (e.routerMethod = e.method))
    } else if (typeof output[key] === 'object' && output[key] !== null) {
      (output[key] as any).routerMethod = ApiActionsMethods[keyUppercase as keyof typeof ApiActionsMethods];
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
  methods: IUniApiInput['methods'];
  serviceSettings: TServiceSettings;
  methodsAllowed: any;
  service: UniService;
  controller: UniController;
  router: UniRouter;

  constructor(inputCfg: IUniApiInput) {
    validateConfig(inputCfg, cfgSchema);

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
