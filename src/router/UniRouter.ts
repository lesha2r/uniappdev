import express, { Router } from 'express';
import _constructor from '../utils/_constructor.js';
import { ICustomRoute, IUniRouterController, UniRouterInput } from '../types/UniRouterTypes.js';
import { IUniApiInput, TServiceSettings } from '../types/UniApiTypes.js';
import { ApiActions } from '../constants.js';

class UniRouter {
  private methods: IUniApiInput['methods'];
  private methodsAllowed: string[];
  private controller: IUniRouterController;
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

  private registerCustoms(router: Router, pre: string, customs: ICustomRoute[]): void {
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

    if (this.methodsAllowed.includes(ApiActions.CUSTOM)) {
      const path = pre;
      const customRoutes = this.methods[ApiActions.CUSTOM] as unknown as ICustomRoute[];
      this.registerCustoms(router, path, customRoutes);
    }

    if (
      (this.methodsAllowed.includes(ApiActions.CREATE) ||
      this.methodsAllowed.includes(ApiActions.CREATEMANY)) &&
      this.methods[ApiActions.CREATE] !== undefined
    ) {
      const path = pre;
      this.registerMiddlewares(router, path, this.methods[ApiActions.CREATE]);
      router.post(path, this.createCtrl);
    }

    if (this.methodsAllowed.includes(ApiActions.DELETEMANY)) {
      const path = pre;
      this.registerMiddlewares(router, path, this.methods[ApiActions.DELETEMANY]);
      router.delete(path, this.deleteCtrl);
    }

    if (this.methodsAllowed.includes(ApiActions.DELETE)) {
      const path = pre + ':id';
      this.registerMiddlewares(router, path, this.methods[ApiActions.DELETE]);
      router.delete(path, this.deleteCtrl);
    }

    if (this.methodsAllowed.includes(ApiActions.GETALL)) {
      const path = pre;
      this.registerMiddlewares(router, path, this.methods[ApiActions.GETALL]);
      router.get(path, this.getAllCtrl);
    }

    if (this.methodsAllowed.includes(ApiActions.DISTINCT)) {
      const path = pre + 'distinct';
      this.registerMiddlewares(router, path, this.methods[ApiActions.DISTINCT]);
      router.get(path, this.distinctCtrl);
    }

    if (this.methodsAllowed.includes(ApiActions.GET)) {
      const path = pre + ':id';
      this.registerMiddlewares(router, path, this.methods[ApiActions.GET]);
      router.get(path, this.getCtrl);
    }

    if (this.methodsAllowed.includes(ApiActions.UPDATE)) {
      const path = pre + ':id';
      this.registerMiddlewares(router, path, this.methods[ApiActions.UPDATE]);
      router.patch(path, this.updateCtrl);
    }

    return router;
  }
}

export default UniRouter;