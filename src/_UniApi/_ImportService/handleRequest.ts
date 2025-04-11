import { Readable } from 'stream';
import ApiError from '../utils/ApiError.js';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
}

interface RequestWithFile {
  file?: UploadedFile;
}

interface HandleRequestResult {
  stream: Readable;
  buffer: Buffer;
  extension: string;
}

const handleRequest = (req: RequestWithFile): HandleRequestResult => {
  if (!req.file) throw new ApiError(400, 'Отсутствует файл');

  const stream = Readable.from(req.file.buffer);

  const buffer = req.file.buffer;
  const extension = req.file.originalname.split('.').pop()?.toLowerCase() || '';

  return {
    stream,
    buffer,
    extension,
  };
};

export default handleRequest;