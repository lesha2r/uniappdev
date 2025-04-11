export enum BaseMethods {
  GET = 'get',
  GETALL = 'getAll',
  CREATE = 'create',
  CREATEMANY = 'createMany',
  UPDATE = 'update',
  DELETE = 'delete',
  DELETEMANY = 'deleteMany',
  EXPORT = 'export',
  DISTINCT = 'distinct',
  CUSTOM = 'custom',
}

export enum BaseMethodsRoutes {
  GET = 'get',
  GETALL = 'get',
  CREATE = 'post',
  CREATEMANY = 'post',
  UPDATE = 'patch',
  DELETE = 'delete',
  DELETEMANY = 'delete',
  EXPORT = 'get',
  DISTINCT = 'get',
}

const config = {
  baseMethods: BaseMethods,
  baseMethodsRoutes: BaseMethodsRoutes,
};

export default config;
