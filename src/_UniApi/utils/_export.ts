import { type TMethodExport } from '../UniApi.js'; // Import TMethodExport from UniApi.ts

const _export = {
  checkExtension: (methodOptions: TMethodExport, exportTo: string): void => {
    if (!methodOptions.extensions) return;

    if (!methodOptions.extensions.includes(exportTo as 'xlsx' | 'csv')) {
      throw new Error('Недопустимое расширение файла в exportTo: ' + exportTo);
    }
  },
};

export default _export;
