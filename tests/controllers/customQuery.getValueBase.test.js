import {expect, describe, test} from '@jest/globals';
import {ObjectId} from 'mongodb';
import {__testDeps} from '../../dist/_UniApi/controllers/methods/getAllRecords/parseCustomQuery.js';

describe('customQuery.getValueBase', () => {
  const testTypes = [
    {type: ObjectId, value: '67d421900b6cdf39ae9e9205', expected: new ObjectId('67d421900b6cdf39ae9e9205')},
    {type: Array, value: 'strxxx, stryyy', expected: ['strxxx', 'stryyy']},
    {type: String, value: 'test', expected: ['test']},
    {type: Number, value: '25', expected: 25},
    {type: Date, value: '2020-10-10', expected: new Date('2020-10-10')},
    {type: Boolean, value: 'true', expected: true},
    {type: Boolean, value: true, expected: true},
    {type: Boolean, value: 'false', expected: false},
    {type: Boolean, value: false, expected: false},
  ];

  testTypes.forEach((testItem, i) => {
    test(`Тип должен быть корректно конвертирован в ${testItem.type.name}`, () => {
      const {value, type, expected} = testItem;
      const result = __testDeps.getValueBase({value, type});
      expect(result).toEqual(expected);
    });
  });
});
