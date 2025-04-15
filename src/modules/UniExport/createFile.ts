import fs from 'fs';
import path from 'path';
import jsonrawtoxlsx from 'jsonrawtoxlsx';
import _files from '../../utils/_files.js';
import config from '../../config/config.js';
import _validations from '../../utils/_validations.js';

const DEFAULT_EXTENSION = 'xlsx';
const DEFAULT_FILENAME = 'export';

export interface ICustomSaver {
    file: {
      path: string;
      name: string;
      ext: string;
      folder: string;
      fullPath: string;
      dir: string;
    };
    headers: { key: string; title: string }[];
    rows: Record<string, any>[];
    data: Record<string, any>[];
  
}

export interface IOptions {
  extension?: string;
  exportFolder?: string;
  exportFullPath?: string;
  customSaver?: (params: ICustomSaver) => void;
}

interface TOutput {
  path: string;
  filename: string;
  filenameFull: string;
  lifetimeHours: number;
  rows: number;
}

const defaultOptions: IOptions = {
  extension: DEFAULT_EXTENSION,
  exportFolder: config.exportFolderName,
  exportFullPath: config.publicPath + config.exportFolderName + '/',
  customSaver: undefined,
};

/**
 * Формирует файл для экспорта
 * @param {string} filename название файла для экспорта
 * @param {{key: string, title: string}[]} headersArr заголовки и ключи столбцов
 * @param {Record<string, any>[]} rowsArr данные для экспорта
 * @param {IOptions} options дополнительные параметры
 * @returns {TOutput} результат экспорта
 */
const createFile = (
  filename: string = DEFAULT_FILENAME,
  headersArr: { key: string; title: string }[],
  rowsArr: Record<string, any>[],
  options: IOptions = defaultOptions
): TOutput => {
  if (!_validations.isArray(headersArr)) {
    throw new Error('headersArr должен быть массивом');
  }

  let output: TOutput = {
    path: '',
    filename: '',
    filenameFull: '',
    lifetimeHours: 0,
    rows: 0,
  };

  if (!rowsArr || !rowsArr.length) return output;

  const optionsRe = { ...defaultOptions, ...options };
  const { extension, exportFolder, exportFullPath } = optionsRe;

  const finalFilename = _files.getXlsxFilename(filename);
  const handledArray = _files.prepareXlsxJson(headersArr, rowsArr);

  const buffer = jsonrawtoxlsx(handledArray, extension);
  const dir = path.join(path.resolve(), exportFullPath || '');

  const filePath = _files.getPathToFile(exportFolder, finalFilename, extension);
  const filenameFull = finalFilename + '.' + extension;
  const lifetimeHours = config.removeOlderThanHours;
  const rowsQty = handledArray.length;

  if (!optionsRe.customSaver) {
    _files.createFolderIfNone(dir);
    fs.writeFileSync(dir + finalFilename + '.' + extension, buffer, 'binary');
  }

  if (optionsRe.customSaver) {
    optionsRe.customSaver({
      file: {
        path: filePath,
        name: finalFilename,
        //@ts-ignore
        ext: extension,
        //@ts-ignore
        folder: exportFolder,
        //@ts-ignore
        fullPath: exportFullPath,
        dir,
      },
      headers: headersArr,
      rows: rowsArr,
      data: handledArray,
    });
  }

  output = {
    path: filePath || '',
    filename: filename || '',
    filenameFull: filenameFull || '',
    lifetimeHours: lifetimeHours || 0,
    rows: rowsQty || 0,
  };

  return output;
};

export default createFile;