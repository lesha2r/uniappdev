import UniApi from "../UniApi.js";

type TMethods = UniApi['methods']; // Use the 'methods' type from IUniApiInput

const _constructor = {
  getAllowedMethods: (methods: TMethods): string[] => {
    const output: string[] = [];

    for (const [key, value] of Object.entries(methods)) {
      if (!Array.isArray(value) && value?.isActive) output.push(key);
    }

    if ('custom' in methods && Array.isArray(methods.custom) && methods.custom.length) {
      output.push('custom');
    }

    return output;
  },
};

export default _constructor;
