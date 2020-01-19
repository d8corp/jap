const yes = e => e

export type defaultResolveResult = {
  success: boolean,
  data: requestType
}
export function defaultResolve (data: requestType = null): defaultResolveResult {
  return {
    success: true,
    data
  }
}

export type defaultRejectResult = {
  error: string,
  data: requestType
}
export function defaultReject (data: requestType, error: Error): defaultRejectResult {
  return {
    error: error.message,
    data
  }
}

export type simpleType = boolean | number | string | null

export type handlerType = simpleType | ((...data: any) => requestType) | {[key: string]: handlerType} | handlerType[] | ((...data: any) => Promise<requestType>)
export type requestType = simpleType | {[key: string]: requestType} | requestType[]

export type resolveHandler = (data: requestType) => requestType
export type resolveArgumentOfJap = boolean | resolveHandler

export type rejectHandler = ((data: requestType, error: Error, handler: handlerType) => requestType)
export type rejectArgumentOfJap = boolean | rejectHandler

export default function jap (
  handler: handlerType,
  request: requestType = null,
  resolveRaw: resolveArgumentOfJap = defaultResolve,
  rejectRaw: rejectArgumentOfJap = defaultReject,
  promises?: Promise<requestType>[],
  context: any = this
) {
  const resolve: resolveHandler = typeof resolveRaw !== 'boolean' ? resolveRaw : resolveRaw ? defaultResolve : yes

  if (typeof handler === 'boolean' || (typeof handler === 'number' && !isNaN(handler)) || typeof handler === 'string') {
    return resolve(handler)
  }

  const reject: rejectHandler = typeof rejectRaw !== 'boolean' ? rejectRaw : rejectRaw ? defaultReject : yes

  if (typeof handler === 'function') {
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
  } else if (typeof handler === 'object') {
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