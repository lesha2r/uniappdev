interface FilesImport {
  fixExcelValueComma: (str: string) => string;
}

const _filesImport: FilesImport = {
  /**
   * Очищает технические символы, которые неверно интерпретируются Excel'ем
   * @param str текст для исправления
   * @returns очищенная строка
   */
  fixExcelValueComma: (str: string): string => {
    // FIX: иногда значение из экселя попадает в формате '"1,234"'
    // Это нарушает разделение значений на столбцы. Ищем такие фрагменты
    // и очищаем их от технических символов
    const regex = /"\d*.*"/g;
    const foundPart = str.match(regex);
    const fixedValue = foundPart
      ? str.replace(foundPart[0], foundPart[0].replace(/["|,]/g, ''))
      : str;

    return fixedValue;
  },
};

export default _filesImport;


