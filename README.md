# JSON Action Protocol
### An idea
*You may use it on server and browser side or native apps, anywhere.  
This is just an idea how we can run actions of other apps from our.  
J.A.P. provides you running of all actions you need in one request via json.*
### About `jap` function
##### Arguments: `jap (`  
- \[ [handler]() | [handlerCollection]() | [handlerList]() \]
- \[, [request]() \]  
- \[, [request]() \]
- \[, [response]() \]
- \[, [promises]() \]
- \[, [options]() \]

`)`
### How it works
#### 1. Primitive Handler
The first argument of `jap` function is `request`,
this is that you get from another app in parsed JSON.  
The second argument is `handler`, this is your api interface.  
If `handler` is primitive like `null`, `true`, `1`, `Symbol()`, `undefined` e.t.c.
then `jap` returns `request` without changes.
```javascript
jap(1, 2); // returns 1
jap(3, undefined); // returns 3, equals jap(3)
jap(undefined, undefined); // returns null, equals jap()
```
#### 2. Function Handler
If you have only one action then only this action should handle any request
```javascript
function square (x) {
  return x * x
}
jap(2, square); // returns 4
jap(3, square); // returns 9
```
> Any request type is used as the first argument of your `handler` except for `array`.  
> `array` spreads to arguments of `handler`
```javascript
function sum (x, y) {
  return x + y
}
jap([2, 3], sum); // returns 5
jap([13, -5], sum); // returns 8
``` 








#### Movies Handler
```javascript
const movies = {
  random (limit) {
    return `movies with limit is ${limit}` 
  },
  filter (type, value, limit) {
    return `movies where ${type} is ${value} with limit is ${limit}`
  }
}
```
#### Comments Handler
```javascript
const comments = ({limit, movie}) => {
  return `comments of "${movie}" with limit is ${limit}`
}
```
#### Handler
```javascript
const handler = {
  movies,
  comments
}
```
#### Request
```javascript
const request = {
  movies: {
    random: 10,
    filter: ['actor', 'Jackie Chan', 10]
  },
  comments: {
    limit: 10,
    movie: 'Back to Future'
  }
}
```
#### Response
```javascript
const responce = {
  movies: {
    random: 'movies with limit is 10',
    filter: 'movies where actor is Jackie Chan with limit is 10'
  },
  comments: 'comments of "Back to Future" with limit is 10'
}
```
