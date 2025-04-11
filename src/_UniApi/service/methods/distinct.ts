import _filters from '../../utils/_filters.js';
import _validations from '../../utils/_validations.js';
import ApiError from '../../utils/ApiError.js';

interface DistinctInput {
  query: Record<string, any>;
  fields: string | string[];
}

const getDbRequests = (db: any, filters: Record<string, any>, fields: string[]): Promise<any>[] => {
  const promises: Promise<any>[] = [];

  const filtersParsed = _filters.parseAndPushFilters(filters);

  const query = { $and: [...filtersParsed] };

  for (const item of fields) {
    const req = db.distinct({
      query,
      field: item,
    });

    promises.push(req);
  }

  return promises;
};

const validateRequest = (filters: Record<string, any>, fields: string | string[]): void => {
  const errors: string[] = [];

  if (!_validations.isObject(filters)) {
    errors.push('Некорректный тип параметра query');
  } else if (!filters || !Object.keys(filters).length) {
    errors.push('Отсутствует обязательный параметр query');
  }

  if (!fields || (Array.isArray(fields) && fields.length === 0)) {
    errors.push('Отсутствует обязательный параметр fields');
  }

  if (errors.length) throw new ApiError(400, errors.join('; '));
};

const parseResultByFields = (fields: string | string[], results: any[]): Record<string, any[]> => {
  const output: Record<string, any[]> = {};

  const fieldsArr = typeof fields === 'string' ? [fields] : fields;

  fieldsArr.forEach((el, i) => {
    output[el] = results[i].result;
  });

  return output;
};

/**
 * Метод distinct
 * @param {DistinctInput} input .
 * @returns {Promise<Record<string, any[]>>} .
 */
async function distinctMethod(this: any, input: DistinctInput): Promise<Record<string, any[]>> {
  const { query, fields } = input;
  validateRequest(query, fields);

  const isArrayFailed =
    Array.isArray(fields) && fields.some((el) => !this.methods.distinct.fields.includes(el));
  const isStringFailed =
    typeof fields === 'string' && !this.methods.distinct.fields.includes(fields);

  if (isArrayFailed || isStringFailed) {
    throw new Error('Невозможно использовать одно или несколько полей из fields');
  }

  const fieldsArr = typeof fields === 'string' ? [fields] : fields;
  const dbRequests = getDbRequests(this.db, query, fieldsArr);
  const results = await Promise.all(dbRequests);

  const resultsByFields = parseResultByFields(fields, results);

  return resultsByFields;
}

export default distinctMethod;