export enum HttpMethods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export enum AuthActions {
  SIGNIN = 'signin',
  SIGNUP = 'signup',
  SIGNOUT = 'signout',
  REFRESH = 'refresh',
  VERIFY = 'verify',
}

export enum ApiActions {
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
  POST = 'post',
}

export enum ApiActionsMethods  {
  GET = HttpMethods.GET,
  GETALL = HttpMethods.GET,
  CREATE = HttpMethods.POST,
  CREATEMANY = HttpMethods.POST,
  UPDATE = HttpMethods.PATCH,
  DELETE = HttpMethods.DELETE,
  DELETEMANY = HttpMethods.DELETE,
  EXPORT = HttpMethods.GET,
  DISTINCT = HttpMethods.GET,
}
