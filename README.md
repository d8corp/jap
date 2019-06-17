# JSON Action Protocol
### An idea
*You may use it on server and browser side or native apps, anywhere.  
This is just an idea how we can run actions of other apps from our.  
J.A.P. provides you running of all actions you need in one request via json.*
### About `jap` function
*The function helps you handle any J.A.P. request.*  
`jap (`  
1. \[ [primitiveHandler](#japprimitivehandler): json primitive | [handler](#japhandler): function | [handlerCollection](#japhandlercollection-request-resolve): array | [handlerList](#handlerList): object \]
2. \[, [request](#japhandler-request): json primitive | [requestCollection](#japhandler-requestCollection): array | [requestList](#requestList): object \]  
3. \[, [resolve](#resolve): function \]
4. \[, [reject](#reject): function \]
5. \[, [promises](#promises): array \]
6. \[, [options](#options): object \]

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

## Reject
If any rules are failed or handler is finished with an error then the result will go
through reject callback function.
You will see all rules for that in this section.
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
Empty [handlerList](#handlerList) or [handlerList](#handlerList) contains only wrong handlers
also returns `null`
```javascript
jap([]) // returns null
jap([undefined]) // returns null
```
but if [handlerList](#handlerList) contains at last one right handler `jap` will return
result of the lats of right handler
```javascript
jap([undefined, 1]) // returns null
jap([1, undefined]) // returns 1
```
*wrong handlers call reject callback function but response will not contain theirs results*


```javascript
jap({}) // returns null
```