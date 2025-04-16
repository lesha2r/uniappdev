import methods from './methods/index.js';
import _aggregations from '../utils/_aggregations.js';
import _constructor from '../utils/_constructor.js';
import _export from '../utils/_export.js';
import { IUniServiceOptions } from '../types/UniServiceTypes.js';
import { ApiActions } from '../constants.js';

class UniService {
  name: string;
  Model: any;
  db: any;
  schema: any;
  serviceSettings: any;
  methods: any;
  methodsAllowed: string[];

  constructor(input: IUniServiceOptions) {
    const { name, Model, db, schema, serviceSettings, methods, methodsAllowed } = input;

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
    this.#checkMethodAllowed(ApiActions.CREATE);
    return methods.createMethod.call(this, input);
  }

  async createMany(input: any): Promise<any> {
    this.#checkMethodAllowed(ApiActions.CREATEMANY);
    return methods.createManyMethod.call(this, input);
  }

  async get(input: any): Promise<any> {
    this.#checkMethodAllowed(ApiActions.GET);
    return methods.getMethod.call(this, input);
  }

  async getAll(input: any, exportTo?: string): Promise<any> {
    if (exportTo) return this.export(input);

    this.#checkMethodAllowed(ApiActions.GETALL);
    return methods.getAllMethod.call(this, input);
  }

  async export(input: any): Promise<any> {
    this.#checkMethodAllowed(ApiActions.EXPORT);
    _export.checkExtension(this.methods.export, input.exportTo);

    input.pagination = false;

    if (!input.fields && this.methods.export.columns && Array.isArray(this.methods.export.columns)) {
      const fields = this.methods.export.columns.map((col: any) => col.key);
      input.fields = fields;
    }

    const data = await this.getAll(input);
    return methods.exportMethod.call(this, input, data);
  }

  async update(input: any): Promise<any> {
    this.#checkMethodAllowed(ApiActions.UPDATE);
    return methods.updateMethod.call(this, input);
  }

  async delete(input: any): Promise<any> {
    this.#checkMethodAllowed(ApiActions.DELETE);
    return methods.deleteMethod.call(this, input);
  }

  async deleteMany(input: any): Promise<any> {
    this.#checkMethodAllowed(ApiActions.DELETEMANY);
    return methods.deleteManyMethod.call(this, input);
  }

  async distinct(input: any): Promise<any> {
    this.#checkMethodAllowed(ApiActions.DISTINCT);
    return methods.distinctMethod.call(this, input);
  }
}

export default UniService;