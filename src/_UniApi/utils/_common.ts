const _common: Record<string, any> = {};

_common.generateKey = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secretPhrase = '';

  for (let i = 0; i < length; i++) {
    secretPhrase += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return secretPhrase;
};

_common.generateExpiredKey = (
  length: number = 16,
  expireMins: number = 10
): { secret: string; expires: Date } => {
  const dateNow = new Date();
  const expirationTime = dateNow.getTime() + expireMins * 60 * 1000; // + m * s * ms
  const key = {
    secret: _common.generateKey(length),
    expires: new Date(expirationTime),
  };

  return key;
};

_common.addDelay = (delay: number = 100): Promise<true> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(true), delay);
  });


_common.convertObjectToArray = (obj: Record<string, any>): any[] =>
  Object.keys(obj).map((key) => obj[key]);

_common.convertArrayToObject = (
  array: Record<string, any>[],
  fieldKey: string,
  valueField?: string
): Record<string, any> => {
  if (!Array.isArray(array)) {
    throw new Error('Аргумент array должен быть массивом');
  }

  const output: Record<string, any> = {};

  for (const el of array) {
    if (fieldKey in el) {
      output[el[fieldKey]] = valueField ? el[valueField] : el;
    }
  }

  return output;
};

_common.getArrayUniques = (array: any[]): any[] => {
  return Array.from(array.reduce((set, el) => set.add(el), new Set()));
};

_common.getArraySum = (array: number[]): number => {
  return array.reduce((partialSum, a) => partialSum + a, 0);
};

/**
 * Возвращает среднее элементов массива
 * @param {number[]} array исходный массив
 * @returns {number} среднее значение
 */
_common.getArrayAvg = (array: number[]): number => {
  if (!array.length) return 0;

  const sum = array.reduce((prev, curr) => prev + curr, 0);
  return sum / array.length;
};

_common.transliterate = (word: string): string => {
  let answer = '';

  const dict: Record<string, string> = {
    Ё: 'YO',
    Й: 'I',
    Ц: 'TS',
    У: 'U',
    К: 'K',
    Е: 'E',
    Н: 'N',
    Г: 'G',
    Ш: 'SH',
    Щ: 'SCH',
    З: 'Z',
    Х: 'H',
    Ъ: '',
    ё: 'yo',
    й: 'i',
    ц: 'ts',
    у: 'u',
    к: 'k',
    е: 'e',
    н: 'n',
    г: 'g',
    ш: 'sh',
    щ: 'sch',
    з: 'z',
    х: 'h',
    ъ: '',
    Ф: 'F',
    Ы: 'I',
    В: 'V',
    А: 'A',
    П: 'P',
    Р: 'R',
    О: 'O',
    Л: 'L',
    Д: 'D',
    Ж: 'ZH',
    Э: 'E',
    ф: 'f',
    ы: 'i',
    в: 'v',
    а: 'a',
    п: 'p',
    р: 'r',
    о: 'o',
    л: 'l',
    д: 'd',
    ж: 'zh',
    э: 'e',
    Я: 'Ya',
    Ч: 'CH',
    С: 'S',
    М: 'M',
    И: 'I',
    Т: 'T',
    Ь: '',
    Б: 'B',
    Ю: 'YU',
    я: 'ya',
    ч: 'ch',
    с: 's',
    м: 'm',
    и: 'i',
    т: 't',
    ь: '',
    б: 'b',
    ю: 'yu',
  };

  for (const char of word) {
    answer += dict[char] ?? char;
  }

  return answer;
};

_common.isJWT = (str: string): boolean => {
  const regex = /^[\w-]+\.[\w-]+\.[\w-]+$/;
  return regex.test(str);
};

_common.arrayToChunks = (arr: any[], maxLength: number = 20): any[][] => {
  const chunks = arr
    .map((_, i) => (i % maxLength === 0 ? arr.slice(i, i + maxLength) : null))
    .filter((e): e is any[] => e !== null);

  return chunks;
};

export default _common;