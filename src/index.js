const yes = e => e

/**
 * @param {*} data
 * @return {{success: boolean, data: *}}
 * */
const defaultResolve = (data = null) => ({
  success: true,
  data
})


/**
 * @param {*} data
 * @param {Error} error
 * @param {*} handler
 * @return {{error: string, data}}
 * */
const defaultReject = (data = null, error, handler) => ({
  error: error.message,
  data
})


/**
 * @param {*} [handler]
 * @param {*} [request]
 * @param {function(data)|boolean} [resolve = defaultResolve]
 * @param {function(request, error:Error, handler)|boolean} [reject]
 * @param {Array<Promise>} [promises]
 * @param {*} [context]
 * */
function jap (handler, request = null, resolve = defaultResolve, reject = defaultReject, promises, context = this) {
  if (resolve === false) {
    resolve = yes
  } else if (resolve === true) {
    resolve = defaultResolve
  }
  if (reject === false) {
    reject = yes
  } else if (reject === true) {
    reject = defaultReject
  }

  const handlerType = typeof handler

  if (handlerType === 'boolean' || (handlerType === 'number' && !isNaN(handler)) || handlerType === 'string') {
    return resolve(handler)
  }

  if (handlerType === 'function') {
    let result
    try {
      if (request instanceof Array) {
        result = handler.apply(context, request)
      } else {
        result = handler.call(context, request)
      }
      if (result && result instanceof Object && 'then' in result) {
        result = result.then(resolve, error => reject(request, error, handler))
        if (promises) {
          promises.push(result)
        }
        return result
      } else {
        return resolve(result)
      }
    } catch (error) {
      return reject(request, error, handler)
    }
  }

  if (handlerType === 'object') {
    if (handler === null) {
      return resolve(null)
    }
    if (handler instanceof Array) {
      let rejected = false
      for (const subHandler of handler) {
        request = jap(subHandler, request, yes, (data, error, handler) => {
          rejected = true
          return reject(data, error, handler)
        }, promises, context)
        if (rejected) {
          return request
        }
      }
      return resolve(request)
    }
    if (request instanceof Array) {
      const {length} = request
      for (let i = 0; i < length; i++) {
        request[i] = jap(handler, request[i], resolve, reject, promises, context)
      }
      return request
    }
    if (typeof request === 'object' && request !== null && (!request.constructor || request.constructor === Object)) {
      for (const key in request) {
        const firstSymbol = key[0]
        if (key in Object.prototype || firstSymbol === '_' || firstSymbol === '$') {
          request[key] = reject(request, Error('Undeclared handler'), handler)
          continue
        }
        const result = jap(handler[key], request[key], resolve, reject, promises, handler)
        if (result && result instanceof Object && 'then' in result) {
          const data = request[key]
          result.then(data => request[key] = data, error => request[key] = reject(data, error, handler[key]))
        } else {
          request[key] = result
        }
      }
      return request
    }
    return reject(request, Error('Undeclared request'), handler);
  }

  return reject(request, Error('Undeclared handler'), handler);
}

export default jap