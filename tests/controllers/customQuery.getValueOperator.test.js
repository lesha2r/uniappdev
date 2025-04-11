import {expect, describe, test, it} from '@jest/globals';
import {ObjectId} from 'mongodb';
import {__testDeps} from '../../dist/_UniApi/controllers/methods/getAllRecords/parseCustomQuery.js';
import _operators from '../../dist/_UniApi/utils/_operators.js';

describe('customQuery.getValueOperator1', () => {
  const unsupportedTypes = [
    {title: '$gte + ObjectId', type: ObjectId, value: '$gte:67d421900b6cdf39ae9e9205', expected: 'err', throw: false},
    {title: '$gte + Array', type: Array, value: '$gte:strxxx, stryyy1', expected: 'err', throw: true},
    {title: '$gte + String', type: String, value: '$gte:test', expected: 'err', throw: true},
    {title: '$incl + ObjectId', type: ObjectId, value: '$incl:67d421900b6cdf39ae9e9205', expected: 'err', throw: true},
  ];

  const testDescr = 'Недопустимые для операторов типы выбрасывают ошибку: ';
  unsupportedTypes.forEach((item, i) => {
    test(testDescr + item.title, () => {
      const {type, value} = item;
      expect(() => __testDeps.getValueOperator({value, type, key: 'test'})).toThrow();
    });
  });
});

const checkAllOperatorsInTestList = (testList, operator) => {
  const allTypes = _operators.getOperatorObj(operator).types;
  const testedTypes = testList.map((item) => item.type);
  const allAreIncluded = allTypes.every((type) => testedTypes.includes(type));
  if (allAreIncluded) return allAreIncluded;

  const notIncludedTypes = allTypes.filter((type) => !testedTypes.includes(type));
  return {notTestedTypes: notIncludedTypes};
};

describe('customQuery.getValueOperator: $incl', () => {
  const correctOutputs = [
    {title: '$incl:String', type: String, value: '$incl:test1', expected: {$regex: new RegExp(`.*test1.*`, 'i')}},
  ];

  test('Каждый из доступных типов покрыт тестами', () => {
    const isOK = checkAllOperatorsInTestList(correctOutputs, '$incl');
    expect(isOK).toBe(true);
  });

  const testDescr = 'Допустимые операторы работают корректно: ';
  correctOutputs.forEach((item) => {
    test(testDescr + item.title, () => {
      const {type, value, expected} = item;
      const result = __testDeps.getValueOperator({value, type, key: 'test'});
      expect(result).toStrictEqual(expected);
    });
  });
});

describe('customQuery.getValueOperator: $excl', () => {
  const correctOutputs = [
    {title: '$excl:String', type: String, value: '$excl:test2', expected: {$not: new RegExp(`.*test2.*`, 'i')}},
  ];

  test('Каждый из доступных типов покрыт тестами', () => {
    const isOK = checkAllOperatorsInTestList(correctOutputs, '$excl');
    expect(isOK).toBe(true);
  });

  const testDescr = 'Допустимые операторы работают корректно: ';
  correctOutputs.forEach((item) => {
    test(testDescr + item.title, () => {
      const {type, value, expected} = item;
      const result = __testDeps.getValueOperator({value, type, key: 'test'});
      expect(result).toStrictEqual(expected);
    });
  });
});

describe('customQuery.getValueOperator: $ne', () => {
  const date = new Date('2025-03-18');

  const correctOutputs = [
    {title: '$ne: String', type: String, value: '$ne:test3', expected: {$ne: 'test3'}},
    {title: '$ne: String[]', type: String, value: '$ne:not1,not2', expected: {$nin: ['not1', 'not2']}},
    {title: '$ne: Boolean', type: Boolean, value: '$ne:true', expected: {$ne: true}},
    {title: '$ne: Number', type: Number, value: '$ne:9009', expected: {$ne: 9009}},
    {title: '$ne: Date', type: Date, value: '$ne:2025-03-18', expected: {$ne: date}},
  ];

  test('Каждый из доступных типов покрыт тестами', () => {
    const isOK = checkAllOperatorsInTestList(correctOutputs, '$ne');
    expect(isOK).toBe(true);
  });

  const testDescr = 'Допустимые операторы работают корректно: ';
  correctOutputs.forEach((item) => {
    test(testDescr + item.title, () => {
      const {type, value, expected} = item;
      const result = __testDeps.getValueOperator({value, type, key: 'test'});
      expect(result).toStrictEqual(expected);
    });
  });
});

const gteLteEtcTest = (operator) => {
  const date = new Date('2025-03-18');

  const correctOutputs = [
    {title: `${operator}:Number`, type: Number, value: `${operator}:1000`, expected: {[operator]: 1000}},
    {title: `${operator}:Date`, type: Date, value: `${operator}:2025-03-18`, expected: {[operator]: date}},
  ];

  test('Каждый из доступных типов покрыт тестами', () => {
    const isOK = checkAllOperatorsInTestList(correctOutputs, operator);
    expect(isOK).toBe(true);
  });

  const testDescr = 'Допустимые операторы работают корректно: ';
  correctOutputs.forEach((item) => {
    test(testDescr + item.title, () => {
      const {type, value, expected} = item;
      const result = __testDeps.getValueOperator({value, type, key: 'test'});
      expect(result).toStrictEqual(expected);
    });
  });
};

describe('customQuery.getValueOperator: $gte', () => gteLteEtcTest('$gte'));
describe('customQuery.getValueOperator: $gt', () => gteLteEtcTest('$gt'));
describe('customQuery.getValueOperator: $lte', () => gteLteEtcTest('$lte'));
describe('customQuery.getValueOperator: $gl', () => gteLteEtcTest('$lt'));

describe('customQuery.getValue for (.*$$.*)', () => {
  test('Для даты $gte + $lte возвращает корректный объект', () => {
    const testStr = '($gte:2024-12-01&&$lte:2025-06-01)';
    const expected = {
      $gte: new Date('2024-12-01'),
      $lte: new Date('2025-06-01'),
    };

    const result = __testDeps.getValue({value: testStr, type: Date, key: 'test'});
    expect(result).toStrictEqual(expected);
  });

  test('Для даты $gte + $lte возвращает корректный объект', () => {
    const testStr = '($gte:2025-01-01&&$lte:2025-06-01&&$ne:2025-03-01)';
    const expected = {
      $gte: new Date('2025-01-01'),
      $lte: new Date('2025-06-01'),
      $ne: new Date('2025-03-01'),
    };

    const result = __testDeps.getValue({value: testStr, type: Date, key: 'test'});
    expect(result).toStrictEqual(expected);
  });

  test('Для даты1&&даты2 возвращает корректный ответ', () => {
    const testStr = '(2024-12-01&&2025-06-01)';
    const expected = [
      new Date('2024-12-01'),
      new Date('2025-06-01'),
    ];

    const result = __testDeps.getValue({value: testStr, type: Date, key: 'test'});
    expect(result).toStrictEqual(expected);
  });
});
