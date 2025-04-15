import { NextFunction } from "express";
import { TReq, TRes } from "./express.js";
import { IUniApiInput, TServiceSettings } from "./UniApiTypes.js";

export interface IUniRouterController {
  create: (...args: any[]) => void;
  createMany: (...args: any[]) => void;
  getAll: (...args: any[]) => void;
  delete: (...args: any[]) => void;
  distinct: (...args: any[]) => void;
  get: (...args: any[]) => void;
  update: (...args: any[]) => void;
  custom: (...args: any[]) => void;
}

type IUniRouterMiddleware = (
    req: TReq,
    res: TRes,
    next: NextFunction
) => Promise<void> | void;

export interface ICustomRoute {
    name?: string;
    method: string;
    path: string;
    routePath?: string;
    controller: (...args: any[]) => void;
    middlewares?: IUniRouterMiddleware |  IUniRouterMiddleware[];
}

export interface UniRouterInput {
  methods: IUniApiInput['methods'];
  methodsAllowed: string[];
  optionsToName?: any;
  controller: IUniRouterController;
  path: string;
  serviceSettings: TServiceSettings
}