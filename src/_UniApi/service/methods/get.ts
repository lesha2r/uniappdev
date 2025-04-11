import { ObjectId } from 'mongodb';
import _aggregations from '../../utils/_aggregations.js';
import ApiError from '../../utils/ApiError.js';

interface GetInput {
  query: Record<string, any>;
  fields?: string[];
}

interface AggregationStage {
  [key: string]: any;
}

async function getByAggregation(this: any, input: GetInput): Promise<any> {
  const { query, fields } = input;
  const customAggregations = this.methods.get.aggregations || {};

  const aggregationPipeline: AggregationStage[] = [];

  if (customAggregations.first) {
    const first = customAggregations.first;
    const pipeline = Array.isArray(first) ? first : [first];

    pipeline.forEach((el) => {
      let stage = el;

      if (typeof el === 'function') {
        stage = el(input);
      }

      if (stage !== undefined) {
        aggregationPipeline.push(stage);
      }
    });
  }

  const $match: AggregationStage = {
    $match: {
      ...query,
    },
  };

  if (query && query._id) {
    $match.$match._id = new ObjectId(query._id);
  }

  aggregationPipeline.push($match);

  if (customAggregations.lookup) {
    const lookups = customAggregations.lookup;
    const lookupsArr = Array.isArray(lookups) ? lookups : [lookups];

    lookupsArr.forEach((el) => {
      let stage;

      if (typeof el === 'function') {
        stage = el(input);
      } else {
        stage = _aggregations.getLookupHandled(el, fields || []);
      }

      if (stage) {
        aggregationPipeline.push(stage);
      }
    });
  }

  if (customAggregations.then) {
    const then = customAggregations.then;
    const pipeline = Array.isArray(then) ? then : [then];

    pipeline.forEach((el) => {
      let stage = el;

      if (typeof el === 'function') {
        stage = el(input);
      }

      if (stage !== undefined) {
        aggregationPipeline.push(stage);
      }
    });
  }

  if (fields && Array.isArray(fields) && fields.length) {
    const $project: AggregationStage = {};

    fields.forEach((f) => ($project[f] = 1));

    aggregationPipeline.push({ $project });
  }

  const found = await this.db.aggregate(aggregationPipeline);

  if (found.ok !== true || !found.result.length) {
    throw new ApiError(404, 'Не найдено');
  }

  return found.result[0];
}

async function getMethod(this: any, input: GetInput): Promise<any> {
  const { query } = input;
  const customAggregations = this.methods.get.aggregations || {};

  const instance = new this.Model();

  if ('beforeGet' in instance && typeof instance.beforeGet === 'function') {
    instance.beforeGet.call(this, input);
  }

  const { first, lookup, then } = customAggregations || {};
  if (first || lookup || then) {
    const aggData = await getByAggregation.call(this, input);
    instance.modelData = aggData;
  } else {
    await instance.get(query);
  }

  if ('onGet' in instance && typeof instance.onGet === 'function') {
    instance.onGet.call(this, input);
  }

  return instance.data();
}

export default getMethod;