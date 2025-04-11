import { Request } from 'express';
import ApiError from '../../utils/ApiError.js';

interface ValidateBodyInput {
  body: Record<string, any>;
  schema: {
    validate: (body: Record<string, any>, fields?: string[]) => { ok: boolean; errors?: string[] };
  };
  fields?: string[];
}

function validateBody(
  req: Request,
  methodId: string,
  { body, schema, fields }: ValidateBodyInput
): void {
  let result;

  if (Array.isArray(fields) && fields.length) {
    result = schema.validate(body, fields);
  } else {
    result = schema.validate(body);
  }

  if (result.ok !== true) {
    throw new ApiError(400, 'Ошибка валидации: ' + (result.errors || []).join('; '));
  }
}

export default validateBody;