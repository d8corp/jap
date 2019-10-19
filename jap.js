'use strict';

function yes (e) {
  return e
}

/**
 * @param {*} [handler]
 * @param {*} [request]
 * @param {function(value)} [resolve]
 * @param {function(request,error:Error,handler)} [reject]
 * @param {Array<Promise>} [promises]
 * @param {*} [context]
 * */
function jap (handler, request, resolve, reject, promises, context) {
  if (arguments.length < 2) {
    request = null
  }
  if (!resolve) {
    resolve = yes
  }
  if (!reject) {
    reject = yes
  }
  const handlerType = typeof handler
  if (handlerType === 'boolean' || (handlerType === 'number' && !isNaN(handler)) || handlerType === 'string') {
    return resolve(handler)
  }
  if (handlerType === 'function') {
    if (request instanceof Array) {
      try {
        return resolve(handler.apply(context, request))
      } catch (e) {
        return reject(request, e, handler)
      }
    }
    try {
      var result = handler.call(context, request);
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
  if (handlerType === 'object' && handler) {
    if (handler === null) {
      return resolve(null)
    }
    if (handler instanceof Array) {
      var length = handler.length;
      var rejected = false;
      for (var i = 0; i < length; i++) {
        request = jap(handler[i], request, yes, function () {
          rejected = true;
          return reject.apply(this, arguments)
        }, promises, context);
        if (rejected) {
          return request
        }
      }
      return resolve(request);
    }
    if (request instanceof Array) {
      const length = request.length;
      for (let i = 0; i < length; i++) {
        jap(handler, request[i], resolve, reject, promises, context);
      }
      return request
    }
    if (typeof request === 'object' && request !== null && (!request.constructor || request.constructor === Object)) {
      for (const key in request) {
        const firstSymbol = key[0]
        if (key in Object.prototype || firstSymbol === '_' || firstSymbol === '$') {
          request[key] = reject(request, Error('Undeclared handler'), handler)
          continue;
        }
        var result = jap(handler[key], request[key], resolve, reject, promises, handler);
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
      return request
    }
    return reject(request, Error('Undeclared request'), handler);
  }
  return reject(request, Error('Undeclared handler'), handler);
}

try {
  module.exports = jap;
} catch (e) {}