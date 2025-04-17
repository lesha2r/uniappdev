import {ObjectId} from 'mongodb';
import Schema from 'validno';

const userSchemaObj = {
  _id: {
    type: ObjectId,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    rules: {
      isEmail: true,
    },
  },
  password: {
    type: String,
    required: true,
    rules: {
      lengthMinMax: [8, 64],
    }
  },
  updatedAt: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    required: false,
  },
}

const userSchema = new Schema(userSchemaObj);

export const userMongoSchema = {
  name: 'string',
  email: 'string',
  password: 'string',
  updatedAt: 'date',
  createdAt: 'date',
};

export default userSchema;
