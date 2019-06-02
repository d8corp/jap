'use strict';

var typeFilter = require('type-filter/typeFilter');
var yes = require('type-filter/handlers/yes');

/**
 * @param {*} [command]
 * @param {*} [handler]
 * @param {function(value)} [resolve]
 * @param {function(command,handler,error?)} [reject]
 * @param {Array<Promise>} [promises]
 * @param {Object} [options]
 * */
function jap (command, handler, resolve, reject, promises, options) {
  if (!resolve) {
    resolve = yes
  }
  if (!reject) {
    reject = yes
  }
  return typeFilter(handler, {
    object: function (handler, options) {
      return typeFilter(command, {
        array: function (request) {
          const length = request.length;
          for (let i = 0; i < length; i++) {
            jap(request[i], handler, resolve, reject, promises, options);
          }
          return command
        },
        object: function (request) {
          for (const key in request) {
            if (key in Object.prototype) continue;
            var result = jap(request[key], handler[key], resolve, reject, promises);
            if (result && result.then) {
              result.then(function (v) {
                return request[key] = v
              }, function (v) {
                return request[key] = v
              })
            } else {
              request[key] = result;
            }
          }
          return command
        },
        other: function () {
          return reject(command, handler);
        }
      })
    },
    function: function () {
      return typeFilter(command, {
        array: function (command) {
          try {
            return resolve(handler.apply(handler, command))
          } catch (e) {
            return reject(command, handler, e)
          }
        },
        other: function () {
          try {
            var result = handler(command);
            if (result && result.then) {
              result = result.then(function (v) {
                return resolve(v);
              }, function (e) {
                return reject(command, handler, e);
              });
              if (promises) {
                promises.push(result)
              }
              return result
            } else {
              return resolve(result)
            }
          } catch (e) {
            return reject(command, handler, e)
          }
        }
      })
    },
    array: function () {
      return handler.reduce(function (command, handler) {
        return jap(command, handler, resolve, reject, promises)
      }, command)
    },
    other: function () {
      return reject(command, handler);
    }
  }, options);
}

module.exports = jap;