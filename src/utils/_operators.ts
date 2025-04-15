import _validations from './_validations.js';
import ApiError from './ApiError.js';

interface OperatorInput {
  value: any;
  type: any;
  key?: string;
  operator?: string;
}

type OperatorFunction = (input: OperatorInput) => any;

interface OperatorConfig {
  key: string;
  types: any[];
  func: OperatorFunction;
  testCases?: Array<{ value: any; type: any; expected: any }>;
}

const getGtLtEtcFunctions = (operator: string, input: OperatorInput): any => {
  const { value: v, type } = input;
  let vRe;

  if (type === Date && _validations.isDateYYYYMMDD(v)) {
    vRe = { [operator]: new Date(v) };
  } else if (type === Number) {
    vRe = { [operator]: Number(v) };
  } else {
    vRe = { [operator]: v };
  }

  return vRe;
};

class Operator {
  key: string;
  regex: RegExp;
  types: any[];
  func: OperatorFunction;
  testCases: Array<{ value: any; type: any; expected: any }>;

  constructor({ key, types, func, testCases = [] }: OperatorConfig) {
    if (!key) throw new ApiError(400, 'Не указан ключ оператора');
    if (!types) throw new ApiError(400, 'Не указаны типы оператора');
    if (!func) throw new ApiError(400, 'Не указана функция оператора');

    this.key = key;
    this.regex = new RegExp(`^\\${key}:?`);
    this.types = types;
    this.func = func;
    this.testCases = testCases;
  }
}

const list: { [key: string]: Operator } = {
  $ne: new Operator({
    key: '$ne',
    types: [String, Number, Boolean, Date],
    testCases: [
      { value: 'test', type: String, expected: { $ne: 'test' } },
      { value: '201', type: Number, expected: { $ne: 201 } },
      { value: 'true', type: Boolean, expected: { $ne: true } },
      { value: 'false', type: Boolean, expected: { $ne: false } },
      { value: '2020-10-10', type: Date, expected: { $ne: new Date('2020-10-10') } },
    ],
    func: (input) => {
      const { value: v, type } = input;
      let vRe;

      if (_validations.isArray(v) && v.length > 1) {
        vRe = { $nin: v };
      } else if (_validations.isArray(v) && v.length === 1) {
        vRe = { $ne: v[0] };
      } else if (type === Date && _validations.isDateYYYYMMDD(v)) {
        vRe = { $ne: new Date(v) };
      } else if (type === Boolean) {
        vRe = { $ne: v === 'true' || v === true };
      } else if (type === Number) {
        vRe = { $ne: Number(v) };
      } else {
        vRe = { $ne: v };
      }

      return vRe;
    },
  }),
  $gte: new Operator({
    key: '$gte',
    types: [Number, Date],
    testCases: [
      { value: '101', type: Number, expected: { $gte: 101 } },
      { value: '2020-10-10', type: Date, expected: { $gte: new Date('2020-10-10') } },
    ],
    func: (inp) => getGtLtEtcFunctions('$gte', inp),
  }),
  $gt: new Operator({
    key: '$gt',
    types: [Number, Date],
    testCases: [
      { value: '201', type: Number, expected: { $gt: 201 } },
      { value: '2020-10-10', type: Date, expected: { $gt: new Date('2020-10-10') } },
    ],
    func: (inp) => getGtLtEtcFunctions('$gt', inp),
  }),
  $lte: new Operator({
    key: '$lte',
    types: [Number, Date],
    testCases: [
      { value: '301', type: Number, expected: { $lte: 301 } },
      { value: '2020-10-10', type: Date, expected: { $lte: new Date('2020-10-10') } },
    ],
    func: (inp) => getGtLtEtcFunctions('$lte', inp),
  }),
  $lt: new Operator({
    key: '$lt',
    types: [Number, Date],
    testCases: [
      { value: '401', type: Number, expected: { $lt: 401 } },
      { value: '2020-10-10', type: Date, expected: { $lt: new Date('2020-10-10') } },
    ],
    func: (inp) => getGtLtEtcFunctions('$lt', inp),
  }),
  $incl: new Operator({
    key: '$incl',
    types: [String],
    testCases: [
      { value: 'partofvalue', type: String, expected: { $regex: new RegExp(`.*partofvalue.*`, 'i') } },
    ],
    func: (input) => {
      const { value: v } = input;

      let vRe = v;
      if (_validations.isArray(v) && v.length > 1) {
        vRe = v.join('|');
      }
      return { $regex: new RegExp(`.*${vRe}.*`, 'i') };
    },
  }),
  $excl: new Operator({
    key: '$excl',
    types: [String],
    testCases: [
      { value: 'partofvalue', type: String, expected: { $not: new RegExp(`.*partofvalue.*`, 'i') } },
    ],
    func: (input) => {
      const { value: v } = input;

      let vRe = v;
      if (_validations.isArray(v) && v.length > 1) {
        vRe = v.join('|');
      }
      return { $not: new RegExp(`.*${vRe}.*`, 'i') };
    },
  }),
};

const andRegex = new RegExp(/^\(.*\)$/);

const _operators: {
  [key: string]: any;
  getAllKeys: () => string[];
  getOperatorObj: (id: string) => Operator;
  hasOperator: (str: string) => boolean;
  getRegex: (ids?: string[]) => RegExp;
  hasAnd: (str: string, regex?: RegExp) => boolean;
  getAndRegexp: () => RegExp;
  checkOperatorAllowsType: (operatorRaw: string, type: any) => void;
  getOperatorValue: (input: OperatorInput) => any;
  parseAnd: (str: string) => string | string[];
} = {
  getAllKeys: () => Object.keys(list),
  getOperatorObj: (id: string) => {
    if (!(id in list)) throw new ApiError(400, `Неизвестный оператор: ${id}`);
    return list[id];
  },
  hasOperator: (str: string) => {
    const regex = _operators.getRegex();
    return regex.test(str);
  },
  getRegex: (ids: string[] = _operators.getAllKeys()) => {
    const str = `^\\${ids.join(':|\\')}${ids.length ? ':' : ''}`;
    return new RegExp(str, 'i');
  },
  hasAnd: (str: string, regex: RegExp = andRegex) => {
    return regex.test(str);
  },
  getAndRegexp: () => andRegex,
  checkOperatorAllowsType: (operatorRaw: string, type: any) => {
    const operator = operatorRaw.toLowerCase();
  
    if (!(operator in list)) throw new ApiError(400, `Неизвестный оператор: ${operator}`);
  
    if (!type || list[operator].types.includes(type)) return;
  
    throw new ApiError(400, `Оператор ${operator} не может быть использован с этим типом`);
  },
  getOperatorValue: (input: OperatorInput) => {
    const { operator, value } = input;
  
    try {
      if (!(operator && operator in list)) return value;
      return list[operator].func(input)
    } catch (err) {
      return value;
    }
  },
  parseAnd: (str: string) => {
    const strRe = str.replace(/^\(/, '').replace(/\)$/, '');
    const parts = strRe.split('&&');
  
    if (parts.length === 1) return parts[0];
  
    return parts;
  }
};


export default _operators;
