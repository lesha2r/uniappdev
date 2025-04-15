import {ObjectId} from 'mongodb';
import Schema from 'validno';

const tokenSchema = new Schema({
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
      enum: ['refresh', 'access'],
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
});

export const tokenMongoSchema = {
  user: 'any',
  token: 'string',
  session: 'number',
  updatedAt: 'date',
  createdAt: 'date',
};

export default tokenSchema;
