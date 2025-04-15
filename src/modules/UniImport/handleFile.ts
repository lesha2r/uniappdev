import csv from 'csv-parser';
import * as XLSX from 'xlsx/xlsx.mjs';
import _dates from '../../utils/_dates.js';
import _filesImport from '../../utils/_filesImport.js';

interface TOptions {
  delimiter?: string;
  hasHeaders?: boolean | null;
  headersCb?: (header: string) => string;
  valuesCb?: (value: string) => any;
  rowCb?: (row: Record<string, any>, index: number) => Record<string, any>;
  dataCb?: (data: Record<string, any>[]) => Promise<Record<string, any>[]>;
  headerRegex?: RegExp;
}

interface TDataParsed {
  records: Record<string, any>[];
  headers: string[];
  rawQty: number;
}

interface ImportDeps {
  stream: any;
  buffer: any;
  extension: 'csv' | 'xlsx';
}

const defaultOptions: TOptions = {
  delimiter: ',',
  hasHeaders: null,
  headersCb: undefined,
  valuesCb: undefined,
  rowCb: undefined,
  dataCb: undefined,
};

const handleRowsUsingCb = (
  records: Record<string, any>[],
  callback: (row: Record<string, any>, index: number) => Record<string, any>
): Record<string, any>[] => {
  const rowsHandled: Record<string, any>[] = [];

  let r = 0;
  while (r < records.length) {
    const row = callback(records[r], r);
    rowsHandled.push(row);
    r++;
  }

  return rowsHandled;
};

const isHeading = (rowStr: string, regex: RegExp): boolean => {
  return regex.test(rowStr);
};

const handleDataParsed = async (
  dataArr: string[],
  optionsInput: TOptions
): Promise<TDataParsed> => {
  const options: TOptions = { ...defaultOptions, ...optionsInput };

  const headers: string[] = [];
  let records: Record<string, any>[] = [];

  let i = 0;
  while (i < dataArr.length) {
    const row = dataArr[i];
    const rowRe = _filesImport.fixExcelValueComma(row);
    const values = rowRe.split(options.delimiter || ',');
    const columnLength = values.length;

    if (
      i === 0 &&
      (options.hasHeaders === true || (options.headerRegex && options.headerRegex.test(rowRe)))
    ) {
      let h = 0;
      while (h < values.length) {
        let val = values[h];
        val = typeof options.headersCb === 'function' ? options.headersCb(val) : val;
        headers.push(val);
        h++;
      }
    } else if (i === 0) {
      values.forEach((_, i) => headers.push(String(i)));
    }

    if ((options.hasHeaders && i > 0) || !options.hasHeaders) {
      const rowObj: Record<string, any> = {};

      for (let columnI = 0; columnI < columnLength; columnI++) {
        const value = options.valuesCb ? options.valuesCb(values[columnI]) : values[columnI];
        const headerName = headers[columnI] || String(columnI);

        rowObj[headerName] = value;
      }

      records.push(rowObj);
    }

    i++;
  }

  if (options.rowCb) records = handleRowsUsingCb(records, options.rowCb);
  if (options.dataCb) records = await options.dataCb(records);

  return { records, headers, rawQty: dataArr.length };
};

const handleXLSX = async (input: Buffer): Promise<string[]> => {
  const table = XLSX.read(input, { type: 'buffer' });
  const sheetName = table.SheetNames[0];
  const workingSheet = table.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_csv(workingSheet);

  return data.split('\n');
};

const handleCSV = (stream: any): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const dataArr: string[] = [];
    const pipeCb = csv({
      separator: ';',
      headers: true,
    });

    stream
      .pipe(pipeCb)
      .on('data', (row: object) => {
        const rowFormatted = Object.values(row)
          .map((r) => r.trim())
          .join(',');
        dataArr.push(rowFormatted);
      })
      .on('end', () => {
        resolve(dataArr);
      })
      .on('error', (err: any) => {
        reject(err);
      });
  });
};

const handleFile = async (
  importDeps: ImportDeps,
  options: TOptions
): Promise<TDataParsed> => {
  const { stream, buffer, extension } = importDeps;

  let dataParsed: string[] = [];

  switch (extension) {
    case 'csv':
      dataParsed = await handleCSV(stream);
      break;
    case 'xlsx':
      dataParsed = await handleXLSX(buffer);
      break;
  }

  const result = await handleDataParsed(dataParsed, options);

  return {
    ...result,
    records: result.records.filter((r) => r !== undefined),
  };
};

export default handleFile;