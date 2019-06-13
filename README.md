# JSON Action Protocol
### An idea
*You may use it on server and browser side or native apps, anywhere.  
This is just an idea how we can run actions of other apps from our.  
J.A.P. provides you running of all actions you need in one request via json.*
### About `jap` function
*The function helps you handle any J.A.P. request.*  
`jap (`  
- \[ [primitiveHandler](#primitivehandler): json primitive | [handler](#handler): function | [handlerCollection](#handlerCollection): array | [handlerList](#handlerList): object \]
- \[, [request](#request): json primitive | [requestCollection](#requestCollection): array | [requestList](#requestList): object \]  
- \[, [resolve](#resolve): function \]
- \[, [reject](#reject): function \]
- \[, [promises](#promises): array \]
- \[, [options](#options): object \]

`)`
## Resolve
If all rules are followed and handler is finished without errors then the result will going
through resolve callback function.
You will see all rules in this section.
### `primitiveHandler`
`primitiveHandler` is any primitive value of json `null`, `boolean`, `number` or `string`.  
`jap` with `primitiveHandler` always returns the handler.
```javascript
jap(null) // returns null
jap(false) // returns false
jap(1) // returns 1
jap(1.1) // returns 1.1
jap('string') // returns 'string'
``` 
### `handler`
`handler` is a function.  
`jap` with `handler` always returns result of `handler`'s call.
```javascript
jap(() => 1) // returns 1
jap(() => {}) // returns undefined
``` 
### `request`
`request` is the second argument of `jap`.  
`request` is a parsed json from another app.  
You may handle `request` by `handler`.  
`handler` gets `request` as the first argument.
```javascript
jap(x => x + x, 1) // returns 2
jap(x => !x, true) // returns false
```
### `requestCollection`
You may provide any count of arguments to `handler` by `requestCollection`.  
`requestCollection` just is an array of arguments.
```javascript
const sum = (x, y) => x + y
jap(sum, [1, 2]) // returns 3
jap(sum, [3, 5]) // returns 8
```

## Reject
If any rules are failed or handler is finished with an error then the result will going
through reject callback function.
You will see all rules for that in this section.
### Wrong handler
If your handler is not matched with [primitiveHandler](#primitiveHandler), [handler](#handler), [handlerCollection](#handlerCollection) or [handlerList](#handlerList)
then `jap` returns `null`
```javascript
jap() // returns null
jap(undefined) // returns null
jap(new Map()) // returns null
jap(Symbol()) // returns null
jap(new class {} ()) // returns null
jap(Error('test')) // returns null
jap(NaN) // returns null
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
jap([undefined, 1, undefined]) // returns 1
```
*wrong handlers call reject callback function but response will not contain theirs results*


```javascript
jap({}) // returns null
```