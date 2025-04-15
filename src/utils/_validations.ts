const _validations = {
  /**
   * Проверяет, что значение является строкой
   * @param value значение
   * @returns результат
   */
  isString: (value: any): boolean => {
    return typeof value === 'string';
  },

  /**
   * Проверяет, что значение является датой
   * @param value значение
   * @returns результат
   */
  isDate: (value: any): boolean => {
    return value instanceof Date && String(value) !== 'Invalid Date';
  },

  /**
   * Проверяет, что значение является числом
   * @param value значение
   * @returns результат
   */
  isNumber: (value: any): boolean => {
    return typeof value === 'number';
  },

  /**
   * Проверяет, что строка содержит только числовое значение
   * @param value строка
   * @returns результат проверки
   */
  stringIsNumber: (value: string | number): boolean => {
    if (typeof value !== 'number' && typeof value !== 'string') return false;
    return /^-?\d+\.?\d+$|^-?\d$/.test(String(value));
  },

  /**
   * Проверяет, что значение является числом и >=Х
   * @param value значение
   * @param gte больше или равно Х
   * @returns результат
   */
  isNumberGte: (value: any, gte: number): boolean => {
    return typeof value === 'number' && value >= gte;
  },

  /**
   * Проверяет, что значение является числом и <=Х
   * @param value значение
   * @param lte меньше или равно Х
   * @returns результат
   */
  isNumberLte: (value: any, lte: number): boolean => {
    return typeof value === 'number' && value <= lte;
  },

  /**
   * Проверяет, что значение является массивом
   * @param value значение
   * @returns результат
   */
  isArray: (value: any): boolean => {
    return Array.isArray(value);
  },

  /**
   * Проверяет, что значения является объектом
   * @param value значение
   * @returns результат
   */
  isObject: (value: any): boolean => {
    return Object.prototype.toString.call(value) === '[object Object]';
  },

  /**
   * Проверяет, что значение является ObjectId
   * @param v значение
   * @returns результат
   */
  isObjectId: (v: any): { result: boolean; details: string } => {
    const isObjId = v?.constructor?.name === 'ObjectId' || false;
    const details = isObjId ? '' : 'Значение должно быть ObjectId';
    return { result: isObjId, details };
  },

  /**
   * Проверяет, что длина значения >=X
   * @param value значение
   * @param min минимальная длина
   * @returns результат
   */
  lengthMin: (value: any, min: number): boolean => {
    if (value === null || value === undefined) {
      return false;
    }
    return value.length >= min;
  },

  /**
   * Проверяет, что длина значения <=X
   * @param value значение
   * @param max максимальная длина
   * @returns результат
   */
  lengthMax: (value: any, max: number): boolean => {
    if (value === null || value === undefined) {
      return false;
    }
    return value.length <= max;
  },

  /**
   * Проверяет, что значение соответствует паттерну email
   * @param value значение
   * @returns результат
   */
  isEmail: (value: any): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Проверяет, что объект содержит ключ
   * @param obj объект для проверки
   * @param key ключ для проверки
   * @returns результат
   */
  hasKey: (obj: object, key: string): boolean => {
    if (obj === null || obj === undefined) {
      return false;
    }
    return key in obj;
  },

  /**
   * Проверяет, что значение не соответствует Х
   * @param value значение
   * @param not не соответствует
   * @returns результат
   */
  isNot: (value: any, not: any): boolean => {
    if (Array.isArray(not)) {
      for (let i = 0; i < not.length; i++) {
        if (value === not[i]) return false;
      }
      return true;
    }
    return value !== not;
  },

  /**
   * Проверяет, что значение соответствует Х
   * @param value значение
   * @param compareTo соответствует
   * @returns результат
   */
  is: (value: any, compareTo: any): boolean => {
    if (Array.isArray(compareTo)) {
      for (let i = 0; i < compareTo.length; i++) {
        if (value === compareTo[i]) return true;
      }
      return false;
    }
    return value === compareTo;
  },

  /**
   * Проверяет, что значение соответствует паттерну YYYY-MM-DD
   * @param value значение
   * @returns результат
   */
  isDateYYYYMMDD: (value: any): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(value);
  },

  /**
   * Проверяет, что значение соответствует паттерну REGEX
   * @param value значение
   * @param regex паттерн для проверки
   * @returns результат
   */
  regexTested: (value: any, regex: RegExp): boolean => {
    if (!regex) throw new Error('regex argument is not defined');
    return regex.test(value);
  },

  /**
   * Проверяет, что значение соответствует паттерну HEX-цвета
   * @param value значение
   * @returns результат
   */
  isHex: (value: any): boolean => {
    const regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    return regex.test(value);
  },
};

export default _validations;
