import _api from '../../utils/_api.js';
import _filters from '../../utils/_filters.js';
import _aggregations from '../../utils/_aggregations.js';
import ApiPaginator from '../../utils/ApiPaginator.js';

const technicalFields = ['_expand'];

interface GetAllInput {
  page?: number;
  perPage?: number;
  sort?: string;
  fields?: string[];
  search?: string;
  filters?: Record<string, any>;
  expand?: any;
  pagination?: boolean;
  debug?: boolean;
}

interface ExtraInput {
  [key: string]: any;
}

async function getAllMethod(this: any, input: GetAllInput, extra?: ExtraInput): Promise<any> {
  const { page, perPage, sort, fields, search, filters, expand, pagination, debug } = input;
  const customAggregations = this.methods.getAll.aggregations || {};
  const outputCb = this.methods.getAll?.outputCb || null;

  const __config = {
    itemsPerPage: 25,
  };

  const paginator =
    pagination === false
      ? new ApiPaginator(__config, {
          page: 1,
          perPage: 10e6,
          debug,
        })
      : new ApiPaginator(__config, {
          page: page || 1,
          perPage: perPage || __config.itemsPerPage,
          debug,
        });

  const matchStage: {$match: {$and: any[]}} = { $match: { $and: [] } };

  if (search) {
    const fields = this.methods.getAll?.search?.fields || [];

    if (!fields || !fields.length) return console.log('No search fields');

    const $or = [];

    // TODO: перенести в utils
    const handleSearchQuery = (str: string): string => {
      return _api.improveSeachQuery(str.replace(/(-| |,)/g, '.*'));
    };

    for (const key of fields) {
      const keySchema = this.schema.schema[key];
      if (!keySchema) continue;

      const typeBySchema = keySchema.type;
      const searchRe = handleSearchQuery(search);

      if (typeBySchema === Number) {
        $or.push({ [key]: Number(searchRe) });
      } else {
        const searchRegex = { $regex: `.*${searchRe}.*`, $options: 'i' };

        if (typeBySchema.name === 'Array') $or.push({ [key]: searchRegex });
        else $or.push({ [key]: searchRegex });
      }
    }

    if ($or.length) {
      matchStage.$match.$and.push({ $or });
    }
  }

  const filtersParsed = _filters.parseAndPushFilters(filters || {});
  matchStage.$match.$and = [...matchStage.$match.$and, ...filtersParsed];

  const skipStage = {
    $skip: paginator.skip,
  };

  const limitStage = {
    $limit: paginator.limit,
  };

  const sortStage = _aggregations.getSortStage(
    sort || this.methods.getAll?.sort?.default || 'createdAt'
  );

  const aggregationPipeline: any[] = [];
  const countPipeline: any[] = [];

  if (matchStage.$match.$and.length) {
    aggregationPipeline.push(matchStage);
    countPipeline.unshift(matchStage);
  }

  aggregationPipeline.push(sortStage);

  // ** Pagination
  if (pagination !== false && !customAggregations.group) {
    aggregationPipeline.push(skipStage);
    aggregationPipeline.push(limitStage);
  }

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
        if (pagination) countPipeline.push(stage);
      }
    });
  }

  if (customAggregations.group) {
    const stage = customAggregations.group;

    const pipeline = Array.isArray(stage) ? stage : [stage];

    pipeline.forEach((el) => {
      let stage = el;

      if (typeof el === 'function') {
        stage = el(input);
      }

      if (stage !== undefined) {
        aggregationPipeline.push(stage);
        if (pagination) countPipeline.push(stage);
      }
    });
  }

  // ** Pagination
  if (pagination !== false && customAggregations.group) {
    aggregationPipeline.push(skipStage);
    aggregationPipeline.push(limitStage);
  }

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

  // FIX: если в мэтч энд только воркспейс
  if (
    Array.isArray(aggregationPipeline) &&
    aggregationPipeline.length &&
    aggregationPipeline[0]?.$match?.$and?.length === 1
  ) {
    aggregationPipeline[0].$match = aggregationPipeline[0].$match.$and[0];
  }

  if (fields && Array.isArray(fields) && fields.length) {
    const $project: Record<string, number> = {};

    fields.forEach((f) => ($project[f] = 1));
    technicalFields.forEach((f) => ($project[f] = 1));

    aggregationPipeline.push({ $project });
  }

  countPipeline.push({ $group: { _id: null, total: { $sum: 1 } } });
  countPipeline.push({ $project: { _id: 0 } });

  const promises = [
    this.db.aggregate(aggregationPipeline),
    this.db.aggregate(countPipeline),
  ];

  const [records, count] = await Promise.all(promises);

  const data =
    outputCb && typeof outputCb === 'function'
      ? await outputCb(records.result, input)
      : records.result;

  const output = {
    found: data,
    total: count.result[0]?.total || 0,
    debug: input,
  };

  const outputPaginated = paginator.getOutput(output.found, output.total, output.debug);
//   __ensureIndexes(() => matchStage.$match, this.db);

  return outputPaginated;
}

export default getAllMethod;