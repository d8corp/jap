'use strict';

var typeFilter = require('type-filter/typeFilter');
var yes = require('type-filter/handlers/yes');

/**
 * @param {*} [handler]
 * @param {*} [request]
 * @param {function(value)} [resolve]
 * @param {function(request,error:Error,handler)} [reject]
 * @param {Array<Promise>} [promises]
 * @param {Object} [options]
 * */
function jap (handler, request, resolve, reject, promises, options) {
  if (!resolve) {
    resolve = yes
  }
  if (!reject) {
    reject = yes
  }
  return typeFilter(handler, {
    object: function (handler, options) {
      return typeFilter(request, {
        array: function (req) {
          const length = req.length;
          for (let i = 0; i < length; i++) {
            jap(handler, req[i], resolve, reject, promises, options);
          }
          return request
        },
        object: function (req) {
          for (const key in req) {
            if (key in Object.prototype) continue;
            var result = jap(handler[key], req[key], resolve, reject, promises);
            if (result && result.then) {
              result.then(function (v) {
                return req[key] = v
              }, function (v) {
                return req[key] = v
              })
            } else {
              req[key] = result;
            }
          }
          return request
        },
        other: function () {
          return reject(request, Error('Undeclared request'), handler);
        }
      })
    },
    function: function () {
      return typeFilter(request, {
        array: function (request) {
          try {
            return resolve(handler.apply(handler, request))
          } catch (e) {
            return reject(request, e, handler)
          }
        },
        other: function () {
          try {
            var result = handler(request);
            if (result && result.then) {
              result = result.then(function (v) {
                return resolve(v);
              }, function (e) {
                return reject(request, e, handler);
              });
              if (promises) {
                promises.push(result)
              }
              return result
            } else {
              return resolve(result)
            }
          } catch (e) {
            return reject(request, e, handler)
          }
        }
      })
    },
    array: function () {
      const length = handler.length;
      for (var i = 0; i < length; i++) {
        request = jap(handler[i], request, resolve, reject, promises)
      }
      return request;
    },
    string: resolve,
    number: resolve,
    boolean: resolve,
    null: resolve,
    other: function () {
      return reject(request, Error('Missed handler'), handler);
    }
  }, options);
}

module.exports = jap;