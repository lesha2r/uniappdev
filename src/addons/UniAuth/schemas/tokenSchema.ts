import {ObjectId} from 'mongodb';
import Schema from 'validno';
import { UniAuthTokenTypes } from '../constants.js';

const tokenSchemaObj = {
  _id: {
    type: ObjectId,
    required: false,
  },
  user: {
    type: ObjectId,
    required: true,
  },
  type: {
    type: String,
    required: true,
    rules: {
      enum: [UniAuthTokenTypes.REFRESH, UniAuthTokenTypes.ACCESS],
    },
  },
  token: {
    type: String,
    required: true,
  },
  session: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    required: false,
  },
}

const tokenSchema = new Schema(tokenSchemaObj);

export const tokenMongoSchema = {
  user: 'any',
  token: 'string',
  type: 'string',
  session: 'number',
  updatedAt: 'date',
  createdAt: 'date',
};

export default tokenSchema;
