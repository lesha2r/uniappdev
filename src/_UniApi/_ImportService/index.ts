import handleFile from './handleFile.js';
import handleRequest from './handleRequest.js';

class ImportService {
  static handleRequest = handleRequest;
  static handleFile = handleFile;
}

export default ImportService;