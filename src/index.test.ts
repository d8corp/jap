/* global it, describe, expect, jest */
import jap from '.'

const resolve = value => ({error: false, value});
const reject = (request, error, handler) => ({request, error, handler});

describe('jap', () => {
  describe('resolve', () => {
    it('handler is a primitive', () => {
      expect(jap(null)).toEqual({success: true, data: null})
      expect(jap(true)).toEqual({success: true, data: true})
      expect(jap(1)).toEqual({success: true, data: 1})
      expect(jap(2.5)).toEqual({success: true, data: 2.5})
      expect(jap('v1.0.0')).toEqual({success: true, data: 'v1.0.0'})
    });
    it('handler is a function', () => {
      // @ts-ignore
      expect(jap(() => {})).toEqual({success: true, data: null})
      expect(jap(() => 1)).toEqual({success: true, data: 1})
      expect(jap((x: number) => x * x, 3)).toEqual({success: true, data: 9})
      expect(jap(x => `x: ${x}`, 'test')).toEqual({success: true, data: 'x: test'})
      expect(jap(x => !x, true)).toEqual({success: true, data: false})
      // @ts-ignore
      expect(jap(x => x(), () => 'test')).toEqual({success: true, data: 'test'})
    });
    it('handler is an array', () => {
      expect(jap([1])).toEqual({success: true, data: 1});
      expect(jap([1, 2])).toEqual({success: true, data: 2});
      expect(jap([3, (x: number) => x * x])).toEqual({success: true, data: 9});
      expect(jap([(x: number) => x * x, (x: number) => x + x], 3)).toEqual({success: true, data: 18});
      expect(jap([(x: number) => x * x, [(x: number) => x + x]], 3)).toEqual({success: true, data: 18});
      expect(jap([(x: number, y: number) => x + y, (x: number) => x * x], [2, 1], result => ({success: true, result}))).toEqual({success: true, result: 9});
    })
    it('handler is an object', () => {
      const square = x => x * x;
      const double = x => x + x;
      expect(jap({test: 1}, {test: null})).toEqual({test: {success: true, data: 1}});
      expect(jap({square}, {square: 3})).toEqual({square: {success: true, data: 9}});
      expect(jap({settings: {version: '1.0.0'}}, {settings: {version: null}})).toEqual({settings: {version: {success: true, data: '1.0.0'}}});
      expect(jap({double: [x => x | 0, double]}, {double: '3'})).toEqual({double: {success: true, data: 6}});
      expect(jap({double: [x => x | 0, double], square}, {double: '4', square: '3'})).toEqual({double: {success: true, data: 8}, square: {success: true, data: 9}});
      const addOne = x => x + 1;
      expect(jap([{test: addOne}, {test: addOne}], {test: 3})).toEqual({data: {test: 5}, success: true});
      expect(jap([{test: addOne}, {test: addOne}, 1], {test: 3})).toEqual({success: true, data: 1});
    })
    it('request spreading', () => {
      expect(jap(1, [])).toEqual({success: true, data: 1});
      expect(jap((x, y) => x + y, [1, 2])).toEqual({success: true, data: 3});
      expect(jap({sum: (x, y) => x + y}, {sum: [1, 2]})).toEqual({sum: {success: true, data: 3}});
      expect(jap({sum: [
        (...a) => a.map(x => x | 0),
        (x, y) => x + y
      ]}, {sum: ['1', '2']})).toEqual({sum: {success: true, data: 3}});
      expect(jap([x => [x | 0, x % 1 * 100 | 0], (ceil, decimal) => ({ceil, decimal})], 3.141)).toEqual({success: true, data: {ceil: 3, decimal: 14}});
    })
    it('resolve argument', () => {
      const resolve = value => ({error: false, value});
      expect(jap(1, [], resolve)).toEqual({error: false, value: 1});
      expect(jap({sum: (x, y) => x + y}, {sum: [1, 2]}, resolve)).toEqual({sum: {error: false, value: 3}});
    })
    it('requestList', () => {
      const resolve = value => ({error: false, value});
      expect(jap(1, {test: 2})).toEqual({success: true, data: 1});
      expect(jap(e => e, {test: 2})).toEqual({success: true, data: {test: 2}});
      expect(jap(1, {test: 1}, resolve)).toEqual({error: false, value: 1});
    })
  });
  describe('reject', () => {
    it('undeclared handler', () => {
      // @ts-ignore
      expect(jap()).toEqual({error: 'Undeclared handler', data: null})
      expect(jap(undefined)).toEqual({error: 'Undeclared handler', data: null})
      expect(jap(NaN)).toEqual({error: 'Undeclared handler', data: null})
      // @ts-ignore
      expect(jap(Symbol())).toEqual({error: 'Undeclared handler', data: null})
      expect(jap([undefined])).toEqual({error: 'Undeclared handler', data: null})
      expect(jap([undefined, 1])).toEqual({error: 'Undeclared handler', data: null})
      expect(jap([1, undefined])).toEqual({error: 'Undeclared handler', data: 1})
      expect(jap([1, undefined, 2])).toEqual({error: 'Undeclared handler', data: 1})
      // @ts-ignore
      expect(jap([1, Symbol(), 2])).toEqual({error: 'Undeclared handler', data: 1})

      expect(jap([1, undefined], null, true, reject)).toEqual({
        error: Error('Undeclared handler'),
        handler: undefined,
        request: 1
      })
      expect(jap([], null, resolve, reject)).toEqual({
        error: false,
        value: null
      })
    })
    it('undeclared request', () => {
      expect(jap({})).toEqual({error: 'Undeclared request', data: null});
    })
    it('wrong nesting', () => {
      expect(jap({settings: {version: '1.0.0'}}, {settings: null})).toEqual({settings: {error: 'Undeclared request', data: null}});
      expect(jap({settings: {version: '1.0.0'}, test: 'passed'}, {settings: null, test: null}, resolve, reject)).toEqual({
        settings: {
          error: Error('Undeclared request'),
          handler: {
            version: '1.0.0'
          },
          request: null
        },
        test: {
          error: false,
          value: 'passed'
        }
      });
    })
    it('reject argument', () => {
      const reject = (request, error, handler) => ({error: error || true, request, handler});
      const settings = {version: '1.0.0'};
      expect(jap(undefined, true, undefined, reject)).toEqual({error: Error('Undeclared handler'), request: true, handler: undefined});
      expect(jap({}, NaN, undefined, reject)).toEqual({error: Error('Undeclared request'), request: NaN, handler: {}});
      expect(jap({settings}, {settings: null}, undefined, reject)).toEqual({settings: {error: Error('Undeclared request'), request: null, handler: settings}});
    })
  });
  describe('async', () => {
    it('function', async () => {
      const handler1 = async e => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return e + e
      };
      const handler2 = async () => {
        throw Error('test')
      };

      const result1 = await jap(handler1, 1, resolve, reject);
      const result2 = await jap(handler2, 1, resolve, reject);

      expect(result1).toEqual({
        error: false,
        value: 2
      });
      expect(result2).toEqual({
        error: Error('test'),
        handler: handler2,
        request: 1
      });
    });
    it('object', async () => {

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
  })
});