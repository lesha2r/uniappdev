import {test, expect, describe} from '@jest/globals';
import _operators from '../../dist/_UniApi/utils/_operators.js';

const valueWithOperator = (operator) => `${operator}:value`;

describe('_operators.getAllKeys', () => {
  test('_operators.getAllKeys()', () => {
    const keys = _operators.getAllKeys();
    expect(Array.isArray(keys)).toBe(true);
    expect(keys.every((key) => key.startsWith('$'))).toBe(true);
  });
});

describe('_operators.hasOperator', () => {
  const allOperators = _operators.getAllKeys();

  allOperators.forEach((operator) => {
    const valueStr = valueWithOperator(operator);

    test(`_operators.hasOperator("${valueStr}")`, () => {
      expect(_operators.hasOperator(valueStr)).toBe(true);
    });
  });
});

describe('_operators.getOperatorObj', () => {
  const allOperators = _operators.getAllKeys();

  allOperators.forEach((operator) => {
    test(`_operators.getOperatorObj("${operator}")`, () => {
      const operatorObj = _operators.getOperatorObj(operator);
      expect(operatorObj).toBeDefined();
      expect(operatorObj.key).toBe(operator);
    });
  });
});

describe('_operators.getRegex', () => {
  const allOperators = _operators.getAllKeys();

  test('_operators.getRegex()', () => {
    const regex = _operators.getRegex();
    const areAllTested = allOperators.every((operator) => regex.test(valueWithOperator(operator)));

    expect(regex).toBeDefined();
    expect(regex instanceof RegExp).toBe(true);
    expect(areAllTested).toBe(true);
  });
});

describe('_operators.getAndRegexp', () => {
  test('_operators.getAndRegexp()', () => {
    const regex = _operators.getAndRegexp();
    const andValues = ['(test)', '(test1&&test2)', '($gte:10&&$lte:20)'];

    expect(regex).toBeDefined();
    expect(regex instanceof RegExp).toBe(true);

    andValues.forEach((andValue) => {
      expect(regex.test(andValue)).toBe(true);
    });
  });
});

describe('_operators.checkOperatorAllowsType', () => {
  const possibleTypes = [Number, Date, String, Array, Boolean];
  const allOperators = _operators.getAllKeys();

  allOperators.forEach((operator) => {
    possibleTypes.forEach((type) => {
      test(`_operators.checkOperatorAllowsType("${operator}", ${type.name})`, () => {
        const operatorObj = _operators.getOperatorObj(operator);
        const types = operatorObj.types;
        if (!types.includes(type)) {
          expect(() => _operators.checkOperatorAllowsType(operator, type)).toThrow();
        } else {
          expect(() => _operators.checkOperatorAllowsType(operator, type)).not.toThrow();
        }
      });
    });
  });
});

describe('_operators.getOperatorValue', () => {
  const allOperators = _operators.getAllKeys();

  allOperators.forEach((operator) => {
    test(`_operators.getOperatorValue test cases for "${operator}"`, () => {
      const operatorObj = _operators.getOperatorObj(operator);

      operatorObj.testCases.forEach((testCase) => {
        const {value, type, expected} = testCase;
        const result = operatorObj.func({value, type});
        expect(result).toEqual(expected);
      });
    });
  });
});

describe('_operators.parseAnd', () => {
  test('_operators.parseAnd()', () => {
    const andValues = ['(test)', '(test1&&test2)', '($gte:10&&$lte:20)'];
    const expected = ['test', ['test1', 'test2'], ['$gte:10', '$lte:20']];

    andValues.forEach((andValue, i) => {
      const result = _operators.parseAnd(andValue);
      expect(result).toStrictEqual(expected[i]);
    });
  });
});

