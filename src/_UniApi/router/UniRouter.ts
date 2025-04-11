import express, { Router, Request, Response, NextFunction } from 'express';
import config from '../config.js';
import _constructor from '../utils/_constructor.js';
import { TConfig, TServiceSettings } from '../UniApi.js';

interface Controller {
  create: (...args: any[]) => void;
  createMany: (...args: any[]) => void;
  getAll: (...args: any[]) => void;
  delete: (...args: any[]) => void;
  distinct: (...args: any[]) => void;
  get: (...args: any[]) => void;
  update: (...args: any[]) => void;
  custom: (...args: any[]) => void;
}

interface CustomRoute {
    name?: string;
    method: string;
    path: string;
    routePath?: string;
    controller: (...args: any[]) => void;
    middlewares?: ((req: Request, res: Response, next: NextFunction) => void) | ((req: Request, res: Response, next: NextFunction) => void)[];
}

interface UniRouterInput {
  methods: TConfig['methods'];
  methodsAllowed: string[];
  optionsToName?: any;
  controller: Controller;
  path: string;
  serviceSettings: TServiceSettings
}

class UniRouter {
  private methods: TConfig['methods'];
  private methodsAllowed: string[];
  private controller: Controller;
  private path: string;
  private serviceSettings: TServiceSettings;

  constructor(input: UniRouterInput) {
    this.methods = input.methods;
    this.methodsAllowed = input.methodsAllowed;
    this.serviceSettings = input.serviceSettings;

    this.controller = input.controller;
    this.path = (input.path + '/').replace(/\/\//g, '').slice(0, -1);

    this.createCtrl = (...a) => this.controller.create(...a);
    this.createManyCtrl = (...a) => this.controller.createMany(...a);
    this.getAllCtrl = (...a) => this.controller.getAll(...a);
    this.deleteCtrl = (...a) => this.controller.delete(...a);
    this.distinctCtrl = (...a) => this.controller.distinct(...a);
    this.getCtrl = (...a) => this.controller.get(...a);
    this.updateCtrl = (...a) => this.controller.update(...a);
    this.customCtrl = (...a) => this.controller.custom(...a);
  }

  private createCtrl: (...args: any[]) => void;
  private createManyCtrl: (...args: any[]) => void;
  private getAllCtrl: (...args: any[]) => void;
  private deleteCtrl: (...args: any[]) => void;
  private distinctCtrl: (...args: any[]) => void;
  private getCtrl: (...args: any[]) => void;
  private updateCtrl: (...args: any[]) => void;
  private customCtrl: (...args: any[]) => void;

  refreshMethodsAllowed(methodsUpdated: any): void {
    this.methods = methodsUpdated;
    this.methodsAllowed = _constructor.getAllowedMethods(this.methods);
  }

  private registerMiddlewares(router: Router, fullPath: string, settings: any): void {
    if (!settings.middlewares) return;

    const middlewares = Array.isArray(settings.middlewares) ? settings.middlewares : [settings.middlewares];
    middlewares.forEach((mw: Function) => {
      (router[settings.routerMethod?.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch'] as Function)(fullPath, mw);
    });
  }

  private registerCustoms(router: Router, pre: string, customs: CustomRoute[]): void {
    customs.forEach((customRoute) => {
      const { method, path, controller } = customRoute;
      const customPath = (pre + path).replace(/\/\//g, '/');

      this.registerMiddlewares(router, customPath, { ...customRoute, routerMethod: method });
      const controllerWrapped = (...a: any[]) => this.customCtrl(...a, controller);
      (router[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch'] as Function)(customPath, controllerWrapped);
    });
  }

  auto(): Router {
    const router = express.Router();
    const pre = '/' + this.path + '/';

    router.use((req, res, next) => {
      next();
    });

    if (this.methodsAllowed.includes(config.baseMethods.CUSTOM)) {
      const path = pre;
      const customRoutes = this.methods[config.baseMethods.CUSTOM] as unknown as CustomRoute[];
      this.registerCustoms(router, path, customRoutes);
    }

    if (
      (this.methodsAllowed.includes(config.baseMethods.CREATE) ||
      this.methodsAllowed.includes(config.baseMethods.CREATEMANY)) &&
      this.methods[config.baseMethods.CREATE] !== undefined
    ) {
      const path = pre;
      this.registerMiddlewares(router, path, this.methods[config.baseMethods.CREATE]);
      router.post(path, this.createCtrl);
    }

    if (this.methodsAllowed.includes(config.baseMethods.DELETEMANY)) {
      const path = pre;
      this.registerMiddlewares(router, path, this.methods[config.baseMethods.DELETEMANY]);
      router.delete(path, this.deleteCtrl);
    }

    if (this.methodsAllowed.includes(config.baseMethods.DELETE)) {
      const path = pre + ':id';
      this.registerMiddlewares(router, path, this.methods[config.baseMethods.DELETE]);
      router.delete(path, this.deleteCtrl);
    }

    if (this.methodsAllowed.includes(config.baseMethods.GETALL)) {
      const path = pre;
      this.registerMiddlewares(router, path, this.methods[config.baseMethods.GETALL]);
      router.get(path, this.getAllCtrl);
    }

    if (this.methodsAllowed.includes(config.baseMethods.DISTINCT)) {
      const path = pre + 'distinct';
      this.registerMiddlewares(router, path, this.methods[config.baseMethods.DISTINCT]);
      router.get(path, this.distinctCtrl);
    }

    if (this.methodsAllowed.includes(config.baseMethods.GET)) {
      const path = pre + ':id';
      this.registerMiddlewares(router, path, this.methods[config.baseMethods.GET]);
      router.get(path, this.getCtrl);
    }

    if (this.methodsAllowed.includes(config.baseMethods.UPDATE)) {
      const path = pre + ':id';
      this.registerMiddlewares(router, path, this.methods[config.baseMethods.UPDATE]);
      router.patch(path, this.updateCtrl);
    }

    return router;
  }
}

export default UniRouter;