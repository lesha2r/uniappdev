interface TOutput {
  skip: number; // пропущено элементов
  limit: number; // элементов на страницу
  page: number; // текущая страница
  total: number; // всего элементов
  totalPages: number; // всего страниц
  left: number; // осталось элементов
  found: object[]; // найденные элементы
  debug?: any; // информация для отладки
}

interface Config {
  itemsPerPage: number; // элементов на страницу
}

interface Options {
  page: number; // текущая страница
  perPage: number; // элементов на страницу
  debug?: boolean; // режим отладки
}

class ApiPaginator {
  config: Config;
  page: number;
  perPage: number;
  debug?: boolean;
  skip: number;
  limit: number;

  /**
   * @param {Config} config конфигурация
   * @param {Options} options доп. опции
   */
  constructor(config: Config, options: Options) {
    this.config = {
      ...config,
    };

    this.page = options.page;
    this.perPage = options.perPage;
    this.debug = options.debug;

    this.skip = (this.perPage || this.config.itemsPerPage) * (this.page - 1);
    this.limit = this.perPage || this.config.itemsPerPage;
  }

  /**
   * Вычисляет количество оставшихся элементов
   * @param {number} total всего элементов
   * @param {number} skipped пропущено элементов
   * @param {number} current текущие элементы
   * @returns {number} оставшиеся элементы
   */
  calcItemsLeft(total: number, skipped: number, current: number): number {
    const output = total - skipped - current;
    if (output < 0) return 0;
    return output;
  }

  /**
   * Вычисляет общее количество страниц
   * @param {number} totalQty всего элементов
   * @param {number} perPage элементов на страницу
   * @returns {number} общее количество страниц
   */
  calcTotalPages(totalQty: number, perPage: number): number {
    return Math.ceil(totalQty / (perPage || this.config.itemsPerPage));
  }

  /**
   * Формирует стандартизированный ответ с указанием данных пагинации
   * @param {any[]} found найденные элементы
   * @param {number} totalQty всего элементов
   * @param {any} debugInfo информация для передачи в debug
   * @returns {TOutput} результат
   */
  getOutput(found: any[], totalQty: number, debugInfo: any = null): TOutput {
    const output: TOutput = {
      skip: this.skip,
      limit: this.limit,
      page: this.page,
      total: totalQty,
      totalPages: this.calcTotalPages(totalQty, this.perPage),
      left: this.calcItemsLeft(totalQty, this.skip, found.length),
      found: found,
    };

    if (this.debug === true) {
      output.debug = debugInfo;
    }

    return output;
  }
}

export default ApiPaginator;
