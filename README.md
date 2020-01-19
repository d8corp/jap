# JSON Action Protocol
### An idea
*You may use it on server and browser side or native apps, anywhere.  
This is just an idea how we can run actions of other apps from our.  
J.A.P. provides you running of all actions you need in one request via json.*
####Request example
```json
{
  "user": {
    "icon": "small",
    "balance": "all",
    "properties": ["name", "age"],
    "test": false
  },
  "payment": {
    "methods": [0, 2]
  },
  "cart": {
    "count": null,
    "items": 4
  }
}
```
#### Response for the example
```json
{
  "user": {
    "icon": {
      "success": true,
      "data": "/img/...jpg"
    },
    "balance": {
      "success": true,
      "data": {
        "cash": 420,
        "points": 13
      }
    },
    "properties": {
      "success": true,
      "data": {
        "name": "Mike",
        "age": 42
      }
    },
    "test": {
      "error": "Undeclared handler",
      "data": false
    }
  },
  "payment": {
    "methods": {
      "success": true,
      "data": [
        {"id": 7, "type": "html"},
        {"id": 12, "type": "iframe"}
      ]
    }
  },
  "cart": {
    "count": {
      "success": true,
      "data": 4
    },
    "items": {
      "error": "The item is not found",
      "data": 4
    }
  }
}
```
### About `jap` function
*The function helps you handle any J.A.P. request.*  
`jap (`  
1. \[ [primitiveHandler](#japprimitivehandler): json primitive | [handler](#japhandler): function | [handlerCollection](#japhandlercollection-request-resolve): array | [handlerList](#japhandlerlist-requestlist): object \]: parsed JSON with functions
2. \[, [request](#japhandler-request): json primitive | [requestCollection](#japhandler-requestCollection): array | [requestList](#japhandlerlist-requestlist): object \]: parsed JSON  
3. \[, [resolve](#resolve): function \]
4. \[, [reject](#reject): function \]
5. \[, [promises](#promises): array \]
6. \[, [context](#context): any \]

`)`
## Resolve
If all rules are followed and handler is finished without errors then the result will go
through resolve callback function.
You will see all rules in this section.
### jap(`primitiveHandler`)
`primitiveHandler` is any primitive value of json `null`, `boolean`, `number` or `string`.  
`jap` with `primitiveHandler` always returns the handler.
```javascript
jap(null) // returns {success: true, data: null}
jap(false) // returns {success: true, data: false}
jap(1) // returns {success: true, data: 1}
jap(1.1) // returns {success: true, data: 1.1}
jap('string') // returns {success: true, data: 'string'}
``` 
### jap(`handler`)
`handler` is a function.  
`jap` with `handler` always returns result of `handler`'s call.
```javascript
jap(() => 1) // returns {success: true, data: 1}
jap(() => {}) // returns {success: true, data: null}
``` 
### jap(handler, `request`)
`request` is a parsed json from another app.  
You may handle `request` by `handler`.  
`handler` gets `request` as the first argument.
```javascript
jap(x => x + x, 1) // returns {success: true, data: 2}
jap(x => !x, true) // returns {success: true, data: false}
jap(x => x.test, {test: 1}) // returns {success: true, data: 1}
```
### jap(handler, `requestCollection`)
You may provide any count of arguments to `handler` by `requestCollection`.  
`requestCollection` just is an array of arguments.
```javascript
const sum = (x, y) => x + y

jap(sum, [1, 2]) // returns {success: true, data: 3}
jap(sum, [3, 5]) // returns {success: true, data: 8}
```
### jap(handler, request, `resolve`)
Default `resolve` is `data => ({success: true, data})`.  
But you can change it as you wish
```javascript
const sum = (x, y) => x + y

jap(sum, [1, 2], data => data) // returns 3
```
You may use `true` if you want to set default `resolve` function and `false` if you want to return only request data
```javascript
const sum = (x, y) => x + y

jap(sum, [1, 2], true) // returns {success: true, data: 3}
jap(sum, [1, 2], false) // returns 3
```
### jap(`handlerCollection`, request, resolve)
You may use an array of any handlers type as `handlerCollection`.  
Each next handler gets result of handle before.
```javascript
const sum = (x, y) => x + y
const square = x => x * x

jap([sum, square], [1, 2]) // returns {success: true, data: 9}
```
### jap(`handlerList`, `requestList`)
`handlerList` works only with `requestList`. They booth are objects.  
You may see whats happen if `handlerList` runs without `requestList` [here](#wrong-request)  
Fields of `handlerList` are any handler type and fields of `requestList` are any request type.
```javascript
const sum = (x, y) => x + y
const square = x => x * x
const math = {sum, square}

jap(math, {square: 4}, false) // returns {square: 16}
jap(math, {square: 3, sum: [3, 4]}, false) // returns {square: 9, sum: 7}

const core = {math, version: '1.0.0'}

jap(core, {math: {square: 5}}, false) // returns {math: {square: 25}}
jap(core, {math: {sum: [5, 7]}, version: null}, false) // returns {math: {sum: 12}, version: '1.0.0'}
```
[resolve](#resolve) is using only for `primitiveHandler` or `handler`

```javascript
const response = JSON.stringify(jap(core, {math: {sum: [5, 7]}, version: null}))
```
returns
```json
{
  "math": {
    "sum": {
      "success": true,
      "data": 12
    }
  },
  "version": {
    "success": true,
    "data": "1.0.0"
  }
}
```
You may pass it to response and handle the response on client by `jap`
```javascript
jap({
  math: {
    sum ({success, data}) {
      if (success) {
        console.log('set sum and update this information on the page', data)
      }
    }
  },
  version ({success, data}) {
    if (success) {
      console.log('update version and run all actions you need', data)
    }
  }
}, JSON.parse(response))
```

> `jap` does not create new object, it changes `requestList`

## Reject
If any rules are failed or handler is finished with an error then the result will go
through reject callback function.
You will see all rules for that in this section.  
Default reject callback function is `(data, error, handler) => ({error: error.message, data})`.  
`data` is data from request  
`error` is an instance of Error
`handler` is a handler which threw the error
### Wrong handler
If your handler is not matched with [primitiveHandler](#primitiveHandler), [handler](#handler), [handlerCollection](#handlerCollection) or [handlerList](#handlerList)
Then `jap` returns `reject` (`null` is default request)  
And you get an error with message `Undeclared handler` 
```javascript
jap() // returns {error: 'Undeclared handler', data: null}
jap(undefined) // returns {error: 'Undeclared handler', data: null}
jap(Symbol()) // returns {error: 'Undeclared handler', data: null}
jap(NaN, 'test') // returns {error: 'Undeclared handler', data: 'test'}
``` 
### Wrong request
If your `handler` is `handlerList` and `request` is not `requestList` then you get an error with message `Undeclared request`
```javascript
jap({}) // returns {error: 'Undeclared request', data: null}
```
### Wrong handlerCollection
If [handlerCollection](#handlerCollection) contains wrong handler then `jap` stops handling on wrong element and returns request or the last result of success [handlerCollection](#handlerCollection)'s element as `request`
```javascript
jap([1, undefined], 2, true, (data, error, handler) => ({data, error, handler}))
// returns {data: 1, error: Error('Undeclared handler'), handler: undefined}
```
> empty `handlerCollection` is legal handler which goes through [resolve](#resolve)
### Promises
You may use async handlers, all promises returned the handlers will be added to the `promises` argument of `jap`
```javascript
const handler = {
  test1: async e => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return e
    },
  test2: async () => {
    throw Error('test')
  }
}

const promises = []

const result = jap(handler, {test1: 1, test2: 2}, true, true, promises)

// promises.length equals 2
// result.test1 is promise
// result.test1 === promises[0]

Promise.all(promises).then(() => {
  // result.test1 is {success: true, data: 1}
  // result.test2 is {error: 'test', data: 2}
})
```

## TODO example
You may look at real example with:
```bash
git clone https://github.com/d8corp/jap.git
cd jap
npm i
npm start
```