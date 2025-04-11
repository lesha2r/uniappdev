import {ObjectId} from 'mongodb';
import mongomod from 'mongomod';
import Schema from 'validno';
import dbTest from '../db/dbUniApi.js';

const userSchemaRaw = {
  _id: {
    type: ObjectId,
    required: false,
  },
  workspace: {
    type: ObjectId,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
};

export const userSchema = new Schema(userSchemaRaw);

const userSchemaOld = new mongomod.Schema({
  _id: 'any',
  name: 'string',
  age: 'number',
  birthDate: 'date',
  isActive: 'boolean',
  workspace: 'any',
});

const User = mongomod.createModel(
    dbTest.db,
    'users',
    userSchemaOld,
);

export const __testUserModel = {
  requiredKeys: Object.keys(userSchemaRaw).filter((key) => userSchemaRaw[key].required),
};

export default User;
