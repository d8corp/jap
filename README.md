# JSON Action Protocol
### An idea
*You may use it on server and browser side or native apps, anywhere.  
This is just an idea how we can run actions of other apps from our.  
J.A.P. provides you running of all actions you need in one request via json.*
### About `jap` function
*The function helps you handle any J.A.P. request.*  
`jap (`  
1. \[ [primitiveHandler](#japprimitivehandler): json primitive | [handler](#japhandler): function | [handlerCollection](#japhandlercollection-request-resolve): array | [handlerList](#japhandlerlist-requestlist): object \]: parsed JSON with functions
2. \[, [request](#japhandler-request): json primitive | [requestCollection](#japhandler-requestCollection): array | [requestList](#japhandlerlist-requestlist): object \]: parsed JSON  
3. \[, [resolve](#resolve): function \]
4. \[, [reject](#reject): function \]
5. \[, [promises](#promises): array \]

`)`
## Resolve
If all rules are followed and handler is finished without errors then the result will go
through resolve callback function.
You will see all rules in this section.
But firstly lets look at the resolve callback function.  
`resolve` gets only one default argument, it is result of handling.
Lets keep our default resolve function here and go through the first arguments of `jap`.
```javascript
const resolve = result => ({
  success: true,
  result
})
```
### jap(`primitiveHandler`)
`primitiveHandler` is any primitive value of json `null`, `boolean`, `number` or `string`.  
`jap` with `primitiveHandler` always returns the handler.
```javascript
jap(null) // returns null
jap(false) // returns false
jap(1) // returns 1
jap(1.1) // returns 1.1
jap('string') // returns 'string'
``` 
### jap(`handler`)
`handler` is a function.  
`jap` with `handler` always returns result of `handler`'s call.
```javascript
jap(() => 1) // returns 1
jap(() => {}) // returns undefined
``` 
### jap(handler, `request`)
`request` is a parsed json from another app.  
You may handle `request` by `handler`.  
`handler` gets `request` as the first argument.
```javascript
jap(x => x + x, 1) // returns 2
jap(x => !x, true) // returns false
jap(x => x.test, {test: 1}) // returns 1
```
### jap(handler, `requestCollection`)
You may provide any count of arguments to `handler` by `requestCollection`.  
`requestCollection` just is an array of arguments.
```javascript
const sum = (x, y) => x + y

jap(sum, [1, 2]) // returns 3
jap(sum, [3, 5]) // returns 8
```
### jap(handler, request, `resolve`)
And finally we can look at [resolve](#resolve) in action
```javascript
const sum = (x, y) => x + y

jap(sum, [1, 2], resolve) // returns {success: true, result: 3}
```
### jap(`handlerCollection`, request, resolve)
You may use an array of any handlers type as `handlerCollection`.  
Each next handler gets result of handle before.
```javascript
const sum = (x, y) => x + y
const square = x => x * x

jap([sum, square], [1, 2], resolve) // returns {success: true, result: 9}
```
### jap(`handlerList`, `requestList`)
`handlerList` works only with `requestList`. They booth are objects.  
You may see whats happen if `handlerList` runs without `requestList` [here](#wrong-request)  
fields of `handlerList` are any handler type and fields of `requestList` are any request type.
```javascript
const sum = (x, y) => x + y
const square = x => x * x
const math = {sum, square}

jap(math, {square: 4}) // returns {square: 16}
jap(math, {square: 3, sum: [3, 4]}) // returns {square: 9, sum: 7}

const core = {math, version: '1.0.0'}

jap(core, {math: {square: 5}}) // returns {math: {square: 25}}
jap(core, {math: {sum: [5, 7]}, version: null}) // returns {math: {sum: 12}, version: '1.0.0'}
```
[resolve](#resolve) is using only for `primitiveHandler` or `handler`

```javascript
const response = JSON.stringify(jap(core, {math: {sum: [5, 7]}, version: null}, resolve))
```
returns
```json
{
  "math": {
    "sum": {
      "success": true,
      "result": 12
    }
  },
  "version": {
    "success": true,
    "result": "1.0.0"
  }
}
```
You may pass it to response and handle the response on client by `jap`
```javascript
jap({
  math: {
    sum (data) {
      if (data.success) {
        console.log('set sum and update this information on the page', data.result)
      }
    }
  },
  version (data) {
    if (data.success) {
      console.log('update version and run all actions you need', data.result)
    }
  }
}, JSON.parse(response))
```

> `jap` does not create new object, it changes `requestList`

## Reject
If any rules are failed or handler is finished with an error then the result will go
through reject callback function.
You will see all rules for that in this section.  
Default reject callback function is `request => request`.  
`reject` gets 3 default arguments: `request`, `error` and `handler`.  
Lets keep our default reject function here
```javascript
const reject = (request, error, handler) => ({error, request, handler})
```
### Wrong handler
If your handler is not matched with [primitiveHandler](#primitiveHandler), [handler](#handler), [handlerCollection](#handlerCollection) or [handlerList](#handlerList)
then `jap` returns `null` (`null` is default request)
```javascript
jap() // returns null
jap(undefined) // returns null
jap(new Map()) // returns null
jap(Symbol()) // returns null
jap(new class {} ()) // returns null
jap(Error('test')) // returns null
jap(NaN, 'test') // returns 'test'
``` 
And you get an error with message `Undeclared handler` 
```javascript
jap(undefined, true, undefined, reject)

// jap returns
return {
  error: Error('Undeclared handler'),
  request: true,
  handler: undefined
}
```
### Wrong request
If your `handler` is `handlerList` and `request` is not `requestList` then you get an error with message `Undeclared request`
```javascript
jap({}, NaN, undefined, reject)

// jap returns
return {
  error: Error('Undeclared request'),
  request: NaN,
  handler: {}
}
```
### Wrong handlerCollection
If [handlerCollection](#handlerCollection) contains wrong handler then `jap` stops handling on wrong element and returns request or the last result of success [handlerCollection](#handlerCollection)'s element as `request`
```javascript
jap([1, undefined], 2, undefined, reject)
// returns {error: Error('Undeclared handler'), request: 1, handler: undefined}
```
> empty `handlerCollection` is legal handler which goes through [resolve](#resolve)
### Promises
You may use async handlers, all promises returned the handlers will be added to the last argument of `jap`
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

const result = jap(handler, {test1: 1, test2: 2}, resolve, reject, promises)

// promises.length equals 2
// result.test1 is promise
// result.test1 === promises[0]

Promise.all(promises).then(() => {
  // result.test1 is {error: false, value: 1}
  // result.test2 is {error: Error('test'), request: 2, handler: handler.test2}
})
```