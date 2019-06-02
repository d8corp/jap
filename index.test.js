/* global it, describe, expect, jest */
const jap = require('./index');

describe('jap', () => {
  describe('command', () => {
    it('simple', () => {
      expect(jap()).toBe(undefined);
    });
    it('any', () => {
      expect(jap(1)).toBe(1);
      expect(jap('1')).toBe('1');
      expect(jap(null)).toBe(null);
      expect(jap(true)).toBe(true);
      expect(jap([])).toEqual([]);
      expect(jap({})).toEqual({});
      expect(jap({test: true})).toEqual({test: true});
    });
  });
  describe('handler', () => {
    it('function', () => {
      expect(jap(3, x => x * x)).toBe(9);
    });
    describe('array', () => {
      it('empty', () => {
        expect(jap(3, [])).toBe(3);
      });
      it('function', () => {
        const square = x => x * x;
        const addOne = x => x + 1;
        expect(jap(3, [square, addOne])).toBe(10);
      });
      it('array', () => {
        const square = x => x * x;
        const addOne = x => x + 1;
        expect(jap(3, [square, [addOne, [addOne, addOne]]])).toBe(12);
      });
      it('object', () => {
        const addOne = x => x + 1;
        expect(jap(3, [{}, addOne])).toBe(4);
      });
      it('command object', () => {
        const addOne = x => x + 1;
        expect(jap({test: 1}, [{test: addOne}, {test: addOne}])).toEqual({test: 3});
      });
      it('any', () => {
        const addOne = x => x + 1;
        expect(jap(1, [addOne, 1, '2', false, null, undefined, new Map()])).toBe(2);
      });
    });
    it('object', () => {
      const handler = {
        square: x => x * x
      };
      const request = {
        square: 3
      };
      const response = {
        square: 9
      };
      expect(jap(request, handler)).toEqual(response);
    });
    it('arguments', () => {
      const handler = {
        sum: (x, y) => x + y
      };

      const request = {
        sum: [3, 6]
      };
      const response = {
        sum: 9
      };

      expect(jap(request, handler)).toEqual(response);
    });
    it('nesting', () => {
      const handler = {
        math: {
          sum: (x, y) => x + y
        }
      };

      const request = {
        math: {
          sum: [3, 6]
        }
      };
      const response = {
        math: {
          sum: 9
        }
      };

      expect(jap(request, handler)).toEqual(response);
    });
    it('deep nesting', () => {
      const handler = {
        calc: {
          math: {
            sum: (x, y) => x + y
          }
        }
      };

      const request = {
        calc: {
          math: {
            sum: [3, 6]
          }
        }
      };
      const response = {
        calc: {
          math: {
            sum: 9
          }
        }
      };

      expect(jap(request, handler)).toEqual(response);
    });
    it('combine', () => {
      const handler = {
        math: {
          max: (...args) => Math.max(...args),
          min: (...args) => Math.min(...args)
        }
      };

      const request = {
        math: {
          min: [3, 6, 1, 12, 5, 22, 8],
          max: [3, 6, 1, 12, 5, 22, 8]
        }
      };
      const response = {
        math: {
          min: 1,
          max: 22
        }
      };

      expect(jap(request, handler)).toEqual(response);
    });
    it('multiple', () => {
      const handler = {
        minmax: (...args) => ({
          min: Math.min(...args),
          max: Math.max(...args)
        })
      };

      const request = [
        {
          minmax: [3, 6, 1, 12, 5, 22, 8]
        }, {
          minmax: [-1, 6, 7, 12, 5, -2, 8]
        }
      ];
      const response = [
        {
          minmax: {
            min: 1,
            max: 22
          }
        }, {
          minmax: {
            min: -2,
            max: 12
          }
        }
      ];
      expect(jap(request, handler)).toEqual(response);
    });
    it('deep multiple', () => {
      const handler = {
        test: {
          minmax: (...args) => ({
            min: Math.min(...args),
            max: Math.max(...args)
          })
        }
      };

      const request = {
        test: [
          {
            minmax: [3, 6, 1, 12, 5, 22, 8]
          }, {
            minmax: [-1, 6, 7, 12, 5, -2, 8]
          }
        ]
      };
      const response = {test: [
        {
          minmax: {
            min: 1,
            max: 22
          }
        }, {
          minmax: {
            min: -2,
            max: 12
          }
        }
      ]};
      expect(jap(request, handler)).toEqual(response);
    });
  });
  describe('resolve', () => {
    it('function', () => {
      const resolve = value => ({error: false, value});
      expect(jap(1, e => e + 1, resolve)).toEqual({
        error: false,
        value: 2
      });
    });
    it('object', () => {
      const resolve = value => ({error: false, value});
      expect(jap({test: 1}, {test: e => e + 1}, resolve)).toEqual({
        test: {
          error: false,
          value: 2
        }
      });
    });
  });
  describe('reject', () => {
    it('handler is undefined', () => {
      const resolve = value => ({error: false, value});
      const reject = (command, handler, error) => ({error: error || true, command, handler});

      const handler = {
        test1: e => e
      };
      expect(jap({
        test1: 1,
        test2: 2
      }, handler, resolve, reject)).toEqual({
        test1: {
          error: false,
          value: 1
        },
        test2: {
          error: true,
          command: 2,
          handler: undefined
        }
      });
      expect(jap({
        test1: {
          test2: 1
        }
      }, handler, resolve, reject)).toEqual({
        test1: {
          error: false,
          value: {
            test2: 1
          }
        }
      });
      expect(jap({
        test2: {
          test1: 1
        }
      }, handler, resolve, reject)).toEqual({
        test2: {
          error: true,
          handler: undefined,
          command: {
            test1: 1
          }
        }
      });
    });
    it('handler is not function', () => {
      const resolve = value => ({error: false, value});
      const reject = (command, handler, error) => ({error: error || true, command, handler});

      const handler = {
        test: 'test3 value'
      };
      expect(jap({
        test: 1
      }, handler, resolve, reject)).toEqual({
        test: {
          error: true,
          command: 1,
          handler: 'test3 value'
        }
      });
    });
    it('an error inside a handler', () => {
      const resolve = value => ({error: false, value});
      const reject = (command, handler, error) => ({error: error || true, command, handler});

      const handler = {
        test: () => {throw Error('test4 error')}
      };
      expect(jap({
        test: 1
      }, handler, resolve, reject)).toEqual({
        test: {
          error: Error('test4 error'),
          command: 1,
          handler: handler.test
        }
      });
    });
  });
  describe('async', () => {
    it('function', async () => {
      const resolve = value => ({error: false, value});
      const reject = (command, handler, error) => ({error: error || true, command, handler});

      const handler1 = async e => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return e
      };

      const handler2 = async () => {
        throw Error('test')
      };

      const result1 = await jap(1, handler1, resolve, reject);
      const result2 = await jap(1, handler2, resolve, reject);

      expect(result1).toEqual({
        error: false,
        value: 1
      });
      expect(result2).toEqual({
        error: Error('test'),
        handler: handler2,
        command: 1
      });
    });
    it('object', async () => {
      const resolve = value => ({error: false, value});
      const reject = (command, handler, error) => ({error: error || true, command, handler});

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

      const result = jap({test1: 1, test2: 2}, handler, resolve, reject, promises);

      expect(promises.length).toBe(2);

      await Promise.all(promises);

      expect(result).toEqual({
        test1: {
          error: false,
          value: 1
        },
        test2: {
          error: Error('test'),
          command: 2,
          handler: handler.test2
        }
      });
    });
  });
});