interface Filters {
  [key: string]: any;
}

interface ParsedFilter {
  [key: string]: { $in: any[] } | any;
}

const _filters = {
  parseAndPushFilters: (filters: Filters): ParsedFilter[] => {
    const output: ParsedFilter[] = [];

    if (!filters || !Object.keys(filters).length) return output;

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined) continue;

      if (Array.isArray(value)) output.push({ [key]: { $in: value } });
      else output.push({ [key]: value });
    }

    return output;
  },
};

export default _filters;
