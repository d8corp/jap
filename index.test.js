/* global it, describe, expect, jest */
const jap = require('./index');

describe('jap', () => {
  describe('resolve', () => {
    it('handler is a primitive', () => {
      expect(jap(null)).toBe(null);
      expect(jap(true)).toBe(true);
      expect(jap(1)).toBe(1);
      expect(jap(2.5)).toBe(2.5);
      expect(jap('v1.0.0')).toBe('v1.0.0');
    });
    it('handler is a function', () => {
      expect(jap(() => 1)).toEqual(1);
      expect(jap(x => x * x, 3)).toBe(9);
      expect(jap(x => `x: ${x}`, 'test')).toBe('x: test');
      expect(jap(x => !x, true)).toBe(false);
      expect(jap(x => x(), () => 'test')).toBe('test');
    });
    it('handler is an array', () => {
      expect(jap([1])).toEqual(1);
      expect(jap([1, 2])).toEqual(2);
      expect(jap([3, x => x * x])).toEqual(9);
      expect(jap([x => x * x, x => x + x], 3)).toEqual(18);
      expect(jap([x => x * x, [x => x + x]], 3)).toEqual(18);
      expect(jap([(x, y) => x + y, x => x * x], [2, 1], result => ({success: true, result}))).toEqual({success: true, result: 9});
    });
    it('handler is an object', () => {
      const square = x => x * x;
      const double = x => x + x;
      expect(jap({test: 1}, {test: null})).toEqual({test: 1});
      expect(jap({square}, {square: 3})).toEqual({square: 9});
      expect(jap({settings: {version: '1.0.0'}}, {settings: {version: null}})).toEqual({settings: {version: '1.0.0'}});
      expect(jap({double: [x => x | 0, double]}, {double: '3'})).toEqual({double: 6});
      expect(jap({double: [x => x | 0, double], square}, {double: '4', square: '3'})).toEqual({double: 8, square: 9});
      const addOne = x => x + 1;
      expect(jap([{test: addOne}, {test: addOne}], {test: 3})).toEqual({test: 5});
      expect(jap([{test: addOne}, {test: addOne}, 1], {test: 3})).toEqual(1);
    });
    it('request spreading', () => {
      expect(jap(1, [])).toBe(1);
      expect(jap((x, y) => x + y, [1, 2])).toBe(3);
      expect(jap({sum: (x, y) => x + y}, {sum: [1, 2]})).toEqual({sum: 3});
      expect(jap({sum: [
        (...a) => a.map(x => x | 0),
        (x, y) => x + y
      ]}, {sum: ['1', '2']})).toEqual({sum: 3});
      expect(jap([x => [x | 0, x % 1 * 100 | 0], (ceil, decimal) => ({ceil, decimal})], 3.141)).toEqual({ceil: 3, decimal: 14});
    });
    it('resolve argument', () => {
      const resolve = value => ({error: false, value});
      expect(jap(1, [], resolve)).toEqual({error: false, value: 1});
      expect(jap({sum: (x, y) => x + y}, {sum: [1, 2]}, resolve)).toEqual({sum: {error: false, value: 3}});
    });
  });
  describe('reject', () => {
    it('undeclared handler', () => {
      expect(jap()).toBe(null);
      expect(jap(undefined)).toBe(null);
      expect(jap(NaN)).toBe(null);
      expect(jap(Symbol())).toBe(null);
      expect(jap(new Map())).toBe(null);
      expect(jap(new Set())).toBe(null);
      expect(jap(Error('test'))).toBe(null);
      expect(jap(new class {} ())).toBe(null);
      expect(jap([])).toEqual(null);
      expect(jap([undefined])).toEqual(null);
      expect(jap([undefined, 1])).toEqual(null);
      expect(jap([1, undefined])).toEqual(1);
      expect(jap({})).toEqual(null);
    });
    it('wrong nesting', () => {
      expect(jap({settings: {version: '1.0.0'}}, {settings: null})).toEqual({settings: null});
    });
    it('reject argument', () => {
      const reject = (request, error, handler) => ({error: error || true, request, handler});
      const settings = {version: '1.0.0'};
      expect(jap({settings}, {settings: null}, undefined, reject)).toEqual({settings: {error: Error('Undeclared request'), request: null, handler: settings}});
    });
  });
  describe('async', () => {
    it('function', async () => {
      const resolve = value => ({error: false, value});
      const reject = (request, error, handler) => ({request, error, handler});

      const handler1 = async e => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return e
      };

      const handler2 = async () => {
        throw Error('test')
      };

      const result1 = await jap(handler1, 1, resolve, reject);
      const result2 = await jap(handler2, 1, resolve, reject);

      expect(result1).toEqual({
        error: false,
        value: 1
      });
      expect(result2).toEqual({
        error: Error('test'),
        handler: handler2,
        request: 1
      });
    });
    it('object', async () => {
      const resolve = value => ({error: false, value});
      const reject = (request, error, handler) => ({request, error, handler});

      const handler = {
        test1: async e => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return e
        },
        test2: async () => {
          throw Error('test')
        }
      };

      const promises = [];

      const result = jap(handler, {test1: 1, test2: 2}, resolve, reject, promises);

      expect(promises.length).toBe(2);

      await Promise.all(promises);

      expect(result).toEqual({
        test1: {
          error: false,
          value: 1
        },
        test2: {
          error: Error('test'),
          request: 2,
          handler: handler.test2
        }
      });
    });
  });
});