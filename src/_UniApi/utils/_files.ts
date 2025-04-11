import fs from 'fs';
import _dates from './_dates.js';
import _common from './_common.js';

const _files: Record<string, any> = {};

/**
 * Создаёт папку, если ее не существует по пути
 * @param {string} folderPath путь к папке
 */
_files.createFolderIfNone = (folderPath: string): void => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

/**
 * Возвращает полный путь до файла
 * @param {string} folder путь до папки
 * @param {string} filename название файла
 * @param {string} [extension] расширение файла
 * @returns {string} полный путь до файла
 */
_files.getPathToFile = (folder: string, filename: string, extension: string = ''): string => {
  return folder + '/' + filename + '.' + extension;
};

/**
 * Генерирует имя файла XLSX со случайным ключом и датой (filename_uid_date)
 * @param {string} filename исходное имя файла
 * @returns {string} имя файла в формате filename_uid_date
 */
_files.getXlsxFilename = (filename: string): string => {
  const dateStr = _dates.getDateStr(new Date());
  const finalFilename = filename + '_' + _common.generateKey(8) + '_' + dateStr;

  return finalFilename;
};

/**
 * Подготавливает JSON для дальнейшей генерации XLSX
 * @param {{title: string, key: string}[]} headersArr массив заголовков
 * @param {any[]} rowsArr строки таблицы
 * @returns {any[]} результат
 */
_files.prepareXlsxJson = (
  headersArr: { title: string; key: string }[],
  rowsArr: Record<string, any>[]
): Record<string, any>[] => {
  const exportArr: Record<string, any>[] = [];

  const headersObj = _common.convertArrayToObject(headersArr, 'key');

  // Обработать строки
  const rowsArrRe = rowsArr.map((row) => {
    const rowRe = { ...row };

    if ('_id' in rowRe) rowRe._id = String(rowRe._id);

    // Значения в массиве объединить через ","
    for (const [key, value] of Object.entries(row)) {
      if (Array.isArray(value)) rowRe[key] = value.join(', ');

      if (key in headersObj && 'valueCb' in headersObj[key]) {
        rowRe[key] = headersObj[key].valueCb(value);
      }
    }

    return rowRe;
  });

  for (const row of rowsArrRe) {
    const newRow: Record<string, any> = {};

    for (const th of headersArr) {
      newRow[th.title] = row[th.key] || '';
    }

    exportArr.push(newRow);
  }

  return exportArr;
};

export default _files;