import { ObjectId } from 'mongodb';
import _operators from '../../../utils/_operators.js';
import _validations from '../../../utils/_validations.js';
import _api from '../../../utils/_api.js';

interface Schema {
  schema: Record<string, { type: any }>;
}

interface Query {
  [key: string]: any;
}

interface GetValueInput {
  value: any;
  type: any;
  key?: string;
}

const getValueBase = ({ value, type }: GetValueInput): any => {
  let output;

  switch (type) {
    case ObjectId:
      output = new ObjectId(value);
      break;
    case Array:
      output = !_validations.isArray(value) ? _api.parseString(value) : value;
      break;
    case String:
      output = _api.parseString(value);
      break;
    case Number:
      output = _validations.stringIsNumber(value) ? Number(value) : value;
      break;
    case Date:
      output = _validations.isDateYYYYMMDD(value) ? new Date(value) : value;
      break;
    case Boolean:
      output = value === 'true' || value === true;
      break;
    default:
      output = value;
      break;
  }

  return output;
};

const getValueOperator = ({ value, type, key }: GetValueInput): any => {
  if (typeof value !== 'string') return value;

  const operator = value.split(':')[0]?.toLowerCase();
  _operators.checkOperatorAllowsType(operator, type);

  const valueWoOperator = value.replace(operator + ':', '');
  const valueRe = getValueBase({ value: valueWoOperator, type });
  const mongoReqObj = _operators.getOperatorValue({ operator, value: valueRe, key, type });

  return mongoReqObj;
};

const getValue = ({ value, type, key }: GetValueInput): any => {
  const hasOperators = _operators.hasOperator(value);
  const hasAnd = _operators.hasAnd(value);

  if (!hasOperators && !hasAnd) {
    return getValueBase({ value, type });
  } else if (hasOperators && !hasAnd) {
    return getValueOperator({ value, type, key });
  } else if (hasAnd) {
    return getAndValue({ value, type, key });
  }
};

const getAndValue = ({ value, type, key }: GetValueInput): any => {
  const values = _operators.parseAnd(value);
  let output: any = {};

  for (const item of values) {
    const result = getValue({ value: item, type, key });
    const outputKey = Object.keys(result)[0];

    if (outputKey !== undefined) {
      output[outputKey] = result[outputKey];
    } else {
      if (!Array.isArray(output)) output = [];
      output.push(result);
    }
  }

  return output;
};

const parseCustomQuery = (
  schema: Schema,
  allowedFilters: string[],
  queryRaw: Query
): Record<string, any> => {
  const query = queryRaw;
  const output: Record<string, any> = {};

  const keysToParse = allowedFilters.filter((key) => key in query && query[key] !== undefined);

  keysToParse.forEach((key) => {
    const value = query[key];
    const type = schema.schema[key]?.type || String;
    output[key] = getValue({ value, type, key });
  });

  return output;
};

export const __testDeps = {
  getValueBase,
  getValue,
  getValueOperator,
};

export default parseCustomQuery;