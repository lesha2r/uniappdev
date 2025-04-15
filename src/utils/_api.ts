interface Api {
  testMe: (ops?: boolean) => string;
  filterByAllowedKeys: (obj: Record<string, any>, allowedKeys: string[]) => Record<string, any>;
  throwIfMisses: (objToCheck: Record<string, any>) => boolean;
  throwIfMissesAll: (objToCheck: Record<string, any>) => boolean;
  validateDateStr: (
    input: Record<string, any>,
    options?: { ignoreUndefined?: boolean; throw?: boolean }
  ) => Record<string, boolean>;
  checkDateYYYYMMDD: (input: string) => boolean;
  parseString: (queryStr?: string) => string[] | undefined;
  parseBoolean: (str: string | boolean, unknownDefault?: boolean) => boolean;
  parseDate: (
    dateStr: string,
    options?: { toUtcZero?: boolean; dayEnd?: boolean }
  ) => Date | undefined;
  checkStrIsNumber: (value: string) => boolean;
  improveSeachQuery: (str: string) => string;
  getExport: (exportTo: string) => string | null;
}

const _api: Api = {
  testMe: (ops = true): string => {
    return typeof ops;
  },

  filterByAllowedKeys: (obj, allowedKeys) => {
    const output: Record<string, any> = {};

    if (allowedKeys && !(allowedKeys instanceof Array)) {
      throw new Error('List of allowed keys must be an Array');
    }

    for (const [key, value] of Object.entries(obj)) {
      if (allowedKeys.includes(key)) output[key] = value;
    }

    return output;
  },

  throwIfMisses: (objToCheck) => {
    const missingKeys: string[] = [];

    for (const [key, value] of Object.entries(objToCheck)) {
      if (value === undefined || value === '') missingKeys.push(key);
    }

    if (missingKeys.length > 0) {
      throw new Error('Отсутствуют обязательные поля: ' + missingKeys.toString());
    }

    return true;
  },

  throwIfMissesAll: (objToCheck) => {
    const missingKeys: string[] = [];

    for (const [key, value] of Object.entries(objToCheck)) {
      if (value === undefined) missingKeys.push(key);
    }

    if (missingKeys.length === Object.keys(objToCheck).length) {
      throw new Error('Отсутствуют обязательные поля: ' + missingKeys.toString());
    } else return true;
  },

  validateDateStr: (input, options = { ignoreUndefined: true, throw: true }) => {
    const inputRe = JSON.parse(JSON.stringify(input));
    const result: Record<string, boolean> = {};

    let hasFailed = false;
    let errorStr = 'Некорректный формат даты: ';
    const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;

    if (options.ignoreUndefined === true) {
      Object.keys(inputRe).forEach((key) =>
        inputRe[key] === undefined ? delete inputRe[key] : {}
      );
    }

    for (const [key, value] of Object.entries(inputRe)) {
      const isValid = regex.test(String(value));

      result[key] = isValid;

      if (!isValid) {
        hasFailed = true;
        errorStr += key + ';';
      }
    }

    if (hasFailed === true) {
      throw new Error(errorStr);
    }

    return result;
  },

  checkDateYYYYMMDD: (input) => {
    if (typeof input !== 'string') return false;

    const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    return regex.test(input);
  },

  parseString: (queryStr) => {
    if (!queryStr || typeof queryStr !== 'string') return undefined;

    const valuesArr = queryStr
      .split(/(?<!\$),/)
      .map((el) => el.trim().replace(/\$,/, ','));

    return valuesArr;
  },

  parseBoolean: (str, unknownDefault = false) => {
    if (typeof str === 'boolean') return str;
    else if (typeof str !== 'string') return unknownDefault;

    return str === 'true' ? true : str === 'false' ? false : unknownDefault;
  },

  parseDate: (dateStr, options = { toUtcZero: true, dayEnd: false }) => {
    const optionsDefaults = { toUtcZero: true, dayEnd: false };
    const optionsRe = { ...optionsDefaults, ...options };

    const { toUtcZero, dayEnd } = optionsRe;

    if (!dateStr || typeof dateStr !== 'string') return undefined;
    const dateStrRe = dateStr.trim();

    const regex = /^\d{4}-\d{1,2}-\d{2}$/;
    if (!regex.test(dateStr.trim())) {
      throw new Error(`Некорректный формат даты`);
    }

    const output = new Date(dateStrRe);

    if (toUtcZero) {
      output.setHours(output.getHours() - output.getTimezoneOffset() / 60);
      output.setUTCHours(0, 0, 0, 0);
    }

    if (dayEnd) {
      output.setUTCHours(23, 59, 59, 999);
    }

    return output;
  },

  checkStrIsNumber: (value) => {
    return /^\d+$/.test(String(value));
  },

  improveSeachQuery: (str) => {
    const output = str.replace(/(е|ё)/gi, '(е|ё)');
    return output;
  },

  getExport: (exportTo) => {
    if (typeof exportTo !== 'string') return null;

    const extension = exportTo.toLowerCase();

    if (!['csv', 'xlsx'].includes(extension)) {
      throw new Error('Недопустимый формат экспорта');
    }

    return extension;
  },
};

export default _api;
