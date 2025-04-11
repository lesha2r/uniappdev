interface ImportResultData {
  records?: any[];
  headers?: string[];
}

interface TechDetails {
  rowNumber: number;
  column?: string | number;
  fullRow: string;
  details?: string;
}

interface ValidationResult {
  ok: boolean;
  joinErrors: () => string;
}

class ImportResult {
  records: any[];
  createdRecords: any[];
  updatedRecords: any[];
  created: number;
  updated: number;
  validated: number;
  invalidated: number;
  errors: number;
  empty: number;
  failedRows: any[];
  headers: string[];
  fileTotalRows: number;

  /**
   * Initializes a new instance of the ImportResult class.
   * @param {ImportResultData} data - Data for initialization.
   */
  constructor(data: ImportResultData) {
    this.records = [];
    this.createdRecords = [];
    this.updatedRecords = [];
    this.created = 0;
    this.updated = 0;
    this.validated = 0;
    this.invalidated = 0;
    this.errors = 0;
    this.empty = 0;
    this.failedRows = [];
    this.headers = data?.headers || [];
    this.fileTotalRows = 0;

    this.countAndSetTotal(data?.records || []);
  }

  /**
   * Creates a technical details object.
   * @param {TechDetails} input - Input details.
   * @returns {TechDetails} - Technical details object.
   */
  static createTech(input: TechDetails): TechDetails {
    return { ...input };
  }

  /**
   * Sets the total number of rows in the file.
   * @param {number} total - Total number of rows.
   */
  #setTotal(total: number): void {
    if (typeof total !== 'number') throw new Error('total must be a number');
    this.fileTotalRows = total;
  }

  /**
   * Counts and sets the total number of rows.
   * @param {any[]} arr - Array of records.
   */
  countAndSetTotal(arr: any[]): void {
    if (!arr || !Array.isArray(arr)) throw new Error('arr must be an array');
    this.#setTotal(arr.length);
  }

  /**
   * Adds a new record to the created or updated list.
   * @param {any} rec - Record to add.
   * @param {boolean} isCreated - Whether the record is created or updated.
   */
  #addRecord(rec: any, isCreated: boolean): void {
    this.records.push(rec);
    if (isCreated) {
      this.createdRecords.push(rec);
      this.created++;
    } else {
      this.updatedRecords.push(rec);
      this.updated++;
    }
  }

  /**
   * Adds a successfully created record.
   * @param {any} rec - Record to add.
   */
  addCreated(rec: any): void {
    this.#addRecord(rec, true);
  }

  /**
   * Adds a successfully updated record.
   * @param {any} rec - Record to add.
   */
  addUpdated(rec: any): void {
    this.#addRecord(rec, false);
  }

  /**
   * Adds a failed record with details.
   * @param {any} rec - Record to add.
   * @param {string} reason - Reason for failure.
   * @param {string | number} [column] - Column details.
   */
  addFailed(rec: any, reason: string = 'Ошибка при импортировании строки', column: string | number = ''): void {
    rec._tech = rec._tech || {};
    rec._tech.details = reason;
    rec._tech.column = column;
    this.failedRows.push(rec._tech);

    this.errors++;
  }

  /**
   * Adds an empty record.
   * @param {any} [rec] - Record to add.
   */
  addEmpty(rec?: any): void {
    this.empty++;
  }

  /**
   * Adds the result of a validation.
   * @param {any} rec - Record to validate.
   * @param {ValidationResult} validationResult - Validation result.
   */
  addValidationResult(rec: any, validationResult: ValidationResult): void {
    const isPassed = validationResult.ok === true;

    if (isPassed) {
      this.validated++;
    } else {
      this.invalidated++;
      this.addFailed(rec, validationResult.joinErrors());
    }
  }
}

export default ImportResult;