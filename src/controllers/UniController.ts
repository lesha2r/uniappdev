import { Request, Response, NextFunction } from 'express';
import createRecord from './methods/createRecord.js';
import deleteRecord from './methods/deleteRecord.js';
import getRecord from './methods/getRecord.js';
import getDistinct from './methods/getDistinct.js';
import updateRecord from './methods/updateRecord.js';
import getAllRecords from './methods/getAllRecords/getAllRecords.js';
import _constructor from '../utils/_constructor.js';
import createManyRecords from './methods/createManyRecords.js';
import deleteManyRecords from './methods/deleteManyRecords.js';
import ApiError from '../utils/ApiError.js';
import UniService from '../service/UniService.js';

import { TReq } from '../types/express.js';
import { TServiceSettings } from '../types/UniApiTypes.js';
import { ApiActions } from '../constants.js';

interface UniControllerInput {
  service: UniService;
  serviceSettings: TServiceSettings;
  methodsAllowed: string[];
}

function responseError(this: any, err: any, req: Request | TReq, res: Response): void {
  if (this.devMode || false) {
    console.log('[UniController] Error: ' + err.message);
  }

  if (err.details === 'duplicate' || err.error?.codeName === 'DuplicateKey') {
    err.message = 'Некоторые значения не соответствуют требованиям уникальности';
    err.code = 409;
  } else if (err.message === 'Nothing found') {
    err.message = 'Не найдена одна из записей';
    err.code = 404;
  }

  res.status(err.code || 500).json({
    ok: false,
    error: err.message,
    errorDetails: err.detailed || undefined,
  });
}

class UniController {
  devMode: boolean;
  name: string;
  methods: any;
  schema: any;
  service: UniService;
  serviceSettings: TServiceSettings;
  methodsAllowed: string[];

  constructor(input: UniControllerInput) {
    this.devMode = true;
    this.name = input.service.name;
    this.methods = input.service.methods;
    this.schema = input.service.schema;
    this.service = input.service;
    this.serviceSettings = input.serviceSettings;
    this.methodsAllowed = input.methodsAllowed;
  }

  responseError(err: any, req: Request, res: Response): void {
    return responseError.call(this, err, req, res);
  }

  static resErr = responseError

  #checkMethodAllowed = (requiredMethod: string): void => {
    if (!this.methodsAllowed.includes(requiredMethod)) {
      throw new ApiError(405, `Метод ${requiredMethod} не поддерживается`);
    }
  };

  refreshMethodsAllowed(methodsUpdated: any): void {
    this.methods = methodsUpdated;
    this.methodsAllowed = _constructor.getAllowedMethods(this.methods);
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      this.#checkMethodAllowed(ApiActions.GET);
      await getRecord.call(this, req, res);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      this.#checkMethodAllowed(ApiActions.GETALL);
      await getAllRecords.call(this, req, res);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (req.query.multiple === 'true') return this.createMany(req, res);
      this.#checkMethodAllowed(ApiActions.CREATE);
      await createRecord.call(this, req, res);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }

  async createMany(req: Request, res: Response): Promise<void> {
    try {
      this.#checkMethodAllowed(ApiActions.CREATEMANY);
      await createManyRecords.call(this, req, res);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      this.#checkMethodAllowed(ApiActions.UPDATE);
      await updateRecord.call(this, req, res);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (req.query.multiple === 'true') return this.deleteMany(req, res);

      this.#checkMethodAllowed(ApiActions.DELETE);
      await deleteRecord.call(this, req, res);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }

  async deleteMany(req: Request, res: Response): Promise<void> {
    try {
      this.#checkMethodAllowed(ApiActions.DELETE);
      await deleteManyRecords.call(this, req, res);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }

  async distinct(req: Request, res: Response): Promise<void> {
    try {
      this.#checkMethodAllowed(ApiActions.DISTINCT);
      await getDistinct.call(this, req, res);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }

  async custom(
    req: Request,
    res: Response,
    next: NextFunction,
    customController: (...args: any[]) => Promise<void>
  ): Promise<void> {
    try {
      await customController.call(this, req, res, next);
    } catch (err) {
      this.responseError(err, req, res);
    }
  }
}

export default UniController;