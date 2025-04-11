const _dates: Record<string, any> = {};

/**
 * Возвращает объект даты из строки YYYY-MM-DD
 * @param {string} str строка даты в формате YYYY-MM-DD
 * @param {'start' | 'end'} [type] тип start/end
 * @returns {Date} объект даты
 */
_dates.dateFromStr = (str: string, type: 'start' | 'end' = 'start'): Date => {
  const output = new Date(str);

  if (type === 'end') output.setDate(output.getDate() + 1);

  return output;
};

/**
 * Возвращает объект даты из строки MM-DD-YYYY
 * @param {string} str строка даты в формате MM-DD-YYYY
 * @returns {Date} объект даты
 */
_dates.dateFromStrMMDDYYYY = (str: string): Date => {
  const [dd, mm, yyyy] = str.split(/\D/);
  return new Date(`${yyyy}-${mm}-${dd}`);
};

/**
 * Возвращает месяц и год объекта даты
 * @param {Date} date входная дата
 * @returns {{month: number, year: number}} месяц и год
 */
_dates.getMonthYear = (date: Date): { month: number; year: number } => {
  if (!(date instanceof Date)) {
    throw new Error(`Некорректный тип аргумента date. Ожидалось: Date, получено: ${typeof date}`);
  }

  return { month: date.getMonth(), year: date.getFullYear() };
};

/**
 * Приводит Date-объект к строковому представлению
 * @param {Date} dateObj объект даты
 * @param {object} [options] параметры
 * @param {string} [options.format] формат строкового представления
 * @param {string} [options.delimiter] разделитель
 * @returns {string} отформатированное строковое представление
 */
_dates.getDateStr = (
  dateObj: Date,
  options?: { format?: string; delimiter?: string }
): string => {
  const optionsDefault = { format: 'dd-mm-yyyy', delimiter: '-' };
  options = { ...optionsDefault, ...options };

  const { format, delimiter } = options;

  const year = dateObj.getFullYear();
  let month: number | string = dateObj.getMonth() + 1;
  let day: number | string = dateObj.getDate();

  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;

  switch (format) {
    case 'yyyy-mm-dd':
      return `${year}${delimiter}${month}${delimiter}${day}`;
    case 'mm-yyyy':
      return `${month}${delimiter}${year}`;
    case 'yyyy-mm':
      return `${year}${delimiter}${month}`;
    case 'dd-mm-yyyy':
      return `${day}${delimiter}${month}${delimiter}${year}`;
    case 'dd-mm-yy':
      return `${day}${delimiter}${month}${delimiter}${year.toString().slice(-2)}`;
    default:
      return `${year}${delimiter}${month}${delimiter}${day}`;
  }
};

/**
 * Возвращает начало месяца
 * @param {Date} date входная дата
 * @returns {Date} начало месяца
 */
_dates.getMonthStart = (date: Date): Date => {
  const output = new Date(date);
  output.setHours(0, 0, 0, 0);
  output.setDate(1);
  return output;
};

/**
 * Возвращает конец месяца
 * @param {Date} date входная дата
 * @returns {Date} конец месяца
 */
_dates.getMonthEnd = (date: Date): Date => {
  const output = new Date(date);
  output.setHours(23, 59, 59, 999);
  output.setMonth(output.getMonth() + 1);
  output.setDate(0);
  return output;
};

/**
 * Возвращает дату минус указанное количество месяцев
 * @param {number} monthsBack количество месяцев назад
 * @param {'month-end' | 'month-start'} [type] тип даты
 * @returns {Date} дата
 */
_dates.getDateMinusMonths = (
  monthsBack: number = 0,
  type?: 'month-end' | 'month-start'
): Date => {
  if (typeof monthsBack !== 'number') {
    throw new Error('monthsBack должен быть числом');
  }

  const now = new Date();
  const dateInPast = new Date();
  dateInPast.setMonth(now.getMonth() - monthsBack);

  if (type === 'month-start') {
    dateInPast.setHours(0, 0, 0, 0);
    dateInPast.setDate(1);
  } else if (type === 'month-end') {
    dateInPast.setHours(23, 59, 59, 999);
    dateInPast.setMonth(dateInPast.getMonth() + 1);
    dateInPast.setDate(0);
  }

  return dateInPast;
};

/**
 * Возвращает дату минус указанное количество дней
 * @param {number} daysBack количество дней назад
 * @returns {Date} дата
 */
_dates.getDateMinusDays = (daysBack: number): Date => {
  if (typeof daysBack !== 'number') throw new Error('daysBack должен быть number');
  const now = new Date();
  now.setDate(now.getDate() - daysBack);
  return now;
};

/**
 * Возвращает количество дней в месяце
 * @param {number} year год
 * @param {number} month месяц (с 0)
 * @returns {number} количество дней
 */
_dates.getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Возвращает минимальное и максимальное значение среди массива дат
 * @param {Date[]} dates массив дат
 * @returns {{min: Date, max: Date}} минимальное и максимальное значения
 */
_dates.getMinMaxDates = (dates: Date[]): { min: Date; max: Date } => {
  const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
  return { min: sorted[0], max: sorted[dates.length - 1] };
};

/**
 * Приводит дату к нулевому часовому поясу
 * @param {Date} dateObj исходная дата
 * @returns {Date} модифицированная дата
 */
_dates.toZeroTimezone = (dateObj: Date): Date => {
  const offsetHours = dateObj.getTimezoneOffset() / 60;
  dateObj.setHours(dateObj.getHours() - offsetHours);
  return dateObj;
};

/**
 * Добавляет часы к текущей дате
 * @param {Date} dateObj исходная дата
 * @param {number} hoursOffset количество часов для добавления
 * @returns {Date} модифицированная дата
 */
_dates.toTimezone = (dateObj: Date, hoursOffset: number): Date => {
  const newDate = new Date(dateObj);
  newDate.setHours(newDate.getHours() + hoursOffset);
  return newDate;
};

/**
 * Возвращает количество дней между двумя датами
 * @param {Date} currentDate дата A
 * @param {Date} pastDate дата B
 * @returns {number} количество дней
 */
_dates.getDaysBetween = (currentDate: Date, pastDate: Date): number => {
  const msBetween = currentDate.getTime() - pastDate.getTime();
  return msBetween / (1000 * 3600 * 24);
};

export default _dates;