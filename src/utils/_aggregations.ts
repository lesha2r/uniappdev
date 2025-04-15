interface Aggregations {
  getSortStage: (sort: string) => { $sort: { [key: string]: number } } | undefined;
  getSetFirstField: (arrKey: string, requiredKey: string, valueIfNull?: any) => object;
  getSetArrayValues: (arrKey: string, requiredKey: string, valueIfNull?: any) => object;
  getLookupHandled: (el: any, fields: string[]) => any;
}

const _aggregations: Aggregations = {
  getSortStage: (sort: string) => {
    let output;

    if (sort && typeof sort === 'string' && sort.length) {
      const isDesc = sort.charAt(0) === '-';
      const sortDir = isDesc ? -1 : 1;
      const sortKey = isDesc ? sort.slice(1, sort.length) : sort;
      output = { $sort: { [sortKey]: sortDir } };
    }

    return output;
  },

  getSetFirstField: (arrKey: string, requiredKey: string, valueIfNull: any = null) => {
    const output = {
      $ifNull: [
        {
          $first: `$${arrKey}.${requiredKey}`,
        },
        valueIfNull,
      ],
    };

    return output;
  },

  getSetArrayValues: (arrKey: string, requiredKey: string, valueIfNull: any = null) => {
    const output = {
      $ifNull: [
        {
          $map: {
            input: `$${arrKey}`,
            as: 'item',
            in: `$$item.${requiredKey}`,
          },
        },
        valueIfNull,
      ],
    };

    return output;
  },

  getLookupHandled: (el: any, fields: string[]) => {
    if (!fields || !fields.length) {
      delete el?.$lookup?._field;
      return el;
    }
    if ('$lookup' in el === false) return el;

    if ('_field' in el.$lookup && !fields.includes(el.$lookup._field)) return null;

    const output = JSON.parse(JSON.stringify(el));
    delete output.$lookup._field;

    return output;
  },
};

export default _aggregations;
