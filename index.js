'use strict';

var typeFilter = require('type-filter/typeFilter');
var yes = require('type-filter/handlers/yes');

/**
 * @param {*} [request]
 * @param {*} [handler]
 * @param {function(value)} [resolve]
 * @param {function(request,handler,error?)} [reject]
 * @param {Array<Promise>} [promises]
 * @param {Object} [options]
 * */
function jap (request, handler, resolve, reject, promises, options) {
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
            jap(req[i], handler, resolve, reject, promises, options);
          }
          return request
        },
        object: function (req) {
          for (const key in req) {
            if (key in Object.prototype) continue;
            var result = jap(req[key], handler[key], resolve, reject, promises);
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
          return reject(request, handler);
        }
      })
    },
    function: function () {
      return typeFilter(request, {
        array: function (request) {
          try {
            return resolve(handler.apply(handler, request))
          } catch (e) {
            return reject(request, handler, e)
          }
        },
        other: function () {
          try {
            var result = handler(request);
            if (result && result.then) {
              result = result.then(function (v) {
                return resolve(v);
              }, function (e) {
                return reject(request, handler, e);
              });
              if (promises) {
                promises.push(result)
              }
              return result
            } else {
              return resolve(result)
            }
          } catch (e) {
            return reject(request, handler, e)
          }
        }
      })
    },
    array: function () {
      return handler.reduce(function (request, handler) {
        return jap(request, handler, resolve, reject, promises)
      }, request)
    },
    other: function () {
      return reject(request, handler);
    }
  }, options);
}

module.exports = jap;