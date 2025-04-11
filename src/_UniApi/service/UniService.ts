import methods from './methods/index.js';
import _aggregations from '../utils/_aggregations.js';
import _constructor from '../utils/_constructor.js';
import _export from '../utils/_export.js';
import config from '../config.js';

interface ServiceInput {
  name: string;
  Model: any;
  db: any;
  schema?: any;
  serviceSettings: any;
  methods: any;
  methodsAllowed: string[];
}

class UniService {
  config: typeof config;
  name: string;
  Model: any;
  db: any;
  schema: any;
  serviceSettings: any;
  methods: any;
  methodsAllowed: string[];

  constructor(input: ServiceInput) {
    const { name, Model, db, schema, serviceSettings, methods, methodsAllowed } = input;

    this.config = config;
    this.name = name;
    this.Model = Model;
    this.db = db;
    this.schema = schema || null;

    this.serviceSettings = serviceSettings;

    this.methods = methods;
    this.methodsAllowed = methodsAllowed;
  }

  #checkMethodAllowed = (requiredMethod: string): void => {
    if (!this.methodsAllowed.includes(requiredMethod)) {
      throw new Error(`Метод ${requiredMethod} не поддерживается`);
    }
  };

  refreshMethodsAllowed(methodsUpdated: any): void {
    this.methods = methodsUpdated;
    this.methodsAllowed = _constructor.getAllowedMethods(this.methods);
  }

  async create(input: any): Promise<any> {
    this.#checkMethodAllowed(this.config.baseMethods.CREATE);
    return methods.createMethod.call(this, input);
  }

  async createMany(input: any): Promise<any> {
    this.#checkMethodAllowed(this.config.baseMethods.CREATEMANY);
    return methods.createManyMethod.call(this, input);
  }

  async get(input: any): Promise<any> {
    this.#checkMethodAllowed(config.baseMethods.GET);
    return methods.getMethod.call(this, input);
  }

  async getAll(input: any, exportTo?: string): Promise<any> {
    if (exportTo) return this.export(input);

    this.#checkMethodAllowed(config.baseMethods.GETALL);
    return methods.getAllMethod.call(this, input);
  }

  async export(input: any): Promise<any> {
    this.#checkMethodAllowed(config.baseMethods.EXPORT);
    _export.checkExtension(this.methods.export, input.exportTo);

    input.pagination = false;

    if (this.methods.export.columns) {
      const fields = this.methods.export.columns.map((col: any) => col.key);
      input.fields = fields;
    }

    const data = await this.getAll(input);
    return methods.exportMethod.call(this, input, data);
  }

  async update(input: any): Promise<any> {
    this.#checkMethodAllowed(config.baseMethods.UPDATE);
    return methods.updateMethod.call(this, input);
  }

  async delete(input: any): Promise<any> {
    this.#checkMethodAllowed(config.baseMethods.DELETE);
    return methods.deleteMethod.call(this, input);
  }

  async deleteMany(input: any): Promise<any> {
    this.#checkMethodAllowed(config.baseMethods.DELETEMANY);
    return methods.deleteManyMethod.call(this, input);
  }

  async distinct(input: any): Promise<any> {
    this.#checkMethodAllowed(config.baseMethods.DISTINCT);
    return methods.distinctMethod.call(this, input);
  }
}

export default UniService;