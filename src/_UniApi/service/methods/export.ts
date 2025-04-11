import ExportService from '../../../_UniApi/_ExportService/index.js';
import { ICustomSaver } from '../../_ExportService/createFile.js';

interface Column {
  key: string;
  title: string;
}

interface ExportInput {
  exportTo: string;
  fields?: string[];
}

interface DataInput {
  found: Record<string, any>[];
}

const generateColumns = (records: Record<string, any>[]): Column[] => {
  const allKeysObj: Record<string, number> = {};

  let i = 0;
  while (i < records.length) {
    Object.keys(records[i]).forEach((k) => {
      if (!(k in allKeysObj)) allKeysObj[k] = 1;
    });
    i++;
  }

  const output = Object.keys(allKeysObj).map((key) => {
    return { key, title: key };
  });

  return output;
};

const checkCustomSaver = (customFunc: any): null | ((params: ICustomSaver) => void) => {
  if (!customFunc) return null;
  if (typeof customFunc !== 'function') return null;

  return customFunc;
};

async function exportMethod(
  this: any,
  input: ExportInput,
  dataInput: DataInput,
  filename?: string
): Promise<any> {
  const { exportTo, fields } = input;

  const filenameRe = filename || this.name;

  const columnsCustom = this.methods.export.columns;
  const customSaver = checkCustomSaver(this.methods.export.customSaver) || undefined;

  let data;

  if (this.methods.export.dataCb && typeof this.methods.export.dataCb === 'function') {
    data = await this.methods.export.dataCb(dataInput, input);
  } else {
    data = dataInput.found;
  }

  let columns: Column[];

  if (columnsCustom && Array.isArray(columnsCustom)) {
    columns = columnsCustom;
  } else if (columnsCustom && typeof columnsCustom === 'function') {
    columns = await columnsCustom(data, input);
  } else {
    columns = generateColumns(data);
  }

  if (fields && Array.isArray(fields) && fields.length) {
    columns = columns.filter((el) => fields.includes(el.key));
  }

  const exportParams = {
    filename: filenameRe,
    columns,
    data,
    options: { extension: exportTo, customSaver },
  };

  const exportResult = ExportService.createFile(
    exportParams.filename,
    exportParams.columns,
    exportParams.data,
    exportParams.options
  );

  return exportResult;
}

export default exportMethod;