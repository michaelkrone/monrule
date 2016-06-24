# monrule
A simple cache to persist expensive idempotent function results in a mongodb database with mongoose.

```js
const fibonacci = require('fibonacci');
const FunctionCache = require('monrule').FunctionCache;

const cache = new FunctionCache(fibonacci.iterate, {mongoose});

// get a simple wrapper function, you might also call cache.get(...)
let getFibonacci = cache.getWrapper();

// fills the cache
getFibonacci(10000).then(result => ...); // 1 - 10 seconds
// reads from the cache
getFibonacci(10000).then(result => ...);; // 1 - 10 milliseconds
	
// promise, invalidate cache results based on a query
c.invalidate({data.number: 13});
// promise, clear all cached results
c.clear(); 
```

## How it works
When creating a new `FunctionCache`, the source of the passed function is hashed. If the wrapped function is called,
a second hash is created from the arguments of the function. These two hashes plus an optional namespace represent the
cache key and identify the stored result. Therefore the function has to be idempotent/referential transparent.

## FunctionCache API

debuglog: `monrule:cache`

### `new FunctionCache(Function function, [Object options])`
Calls the wrapped function and looks up a cached result for the given arguments. If no cache result can be found the
wrapped function is called and the result is cached in the database and returned.

`function`: A Function which result should be cached. Note that this has to be an idempotent and referential transparent function. If the source of
the function changes, a new hash will be generated the next time the cache is created.

`options`: 

`mongoose`: `Object` A mongoose instance used to communicate with the database

`[modelName]`: `String` Name of the model to store the results with, defaults to 'ObjectBucket'. If the model is a registered mongoose
model it will be used.

`[namespace]`: `String` A prefix for the id, will be used to invalidate all objects with this prefix, defaults to 'FunctionCache'

`[saveWrite]`: `Boolean`, defaults to true. If set to false, the function result will be returned without waiting for the database write operation to finish.

`[resolver]`: `Function` A function that is called for every id generation with the arguments of the cached function. It might return any truthy value.
This is usefull if only a fraction of the arguments should be considered for generating an object id. This is usefull if not the complete arguments
need to be hashed, e.g. if objects can be identified by its id:

```js
const cache = new FunctionCache(fn, {resolver: (d1, d2) => [d1._id, d2._id]});

function compute(document1, document2) {
	// generate some data
}

```

### `Promise get(Arguments arguments)`
Calls the wrapped function and looks up a cached result for the given arguments. If no cache result can be found the
wrapped function is called and the result is cached in the database and returned.
```js
f.get(a, b, c);
```

### `Function getWrapper()`
Returns the wrapped function to work with the cache like a normal function. Calls the `get` method with the correct
class bound to `this`.
```js
const f = fCache.getWrapper();
f(a, b, c);
```

### `Promise clear()`
Clears the cache and removes all entries with the namespace set in the options. If no namespace has been
set, the default namespace will be used. The promise resolves to the mongodb response for the remove command.
```js
fCache.clear().then(...);
```

### `Promise invalidate(Object queryObject)`
Invalidate (read: remove) all results that match the query object. Note that the cached data is per default saved as
a `data` object, so you might prefix your queries accordingly. The promise resolves to the mongodb response for the remove command.
```js
fCache.invalidate({'data.prop': dataValue}).then(...);
```

### static `String getId(a, b, c, ...)`
Generate a hash for the given arguments, if a resolver function is given in the options the resolver is called
with the given arguments and the result of the resolver function is used to generate a hash.
```js
FunctionCache.getId(a, b, c);
```

## ObjectStore API

debuglog: `monrule:store`

### Options

`mongoose`: A mongoose instance used to communicate with the database

`[modelName]`: Name of the model to store the results with, defaults to 'ObjectBucket'
If no such model has been registered, a standard model will be used.

```js
const ObjectStore = require('monrule').ObjectStore;
const oStore = new ObjectStore({mongoose: require('mongoose')});
```

### `Promise set(String id, Promise|Function|Object value)`
Set a value in the store with the given id. If a value with this id exists it will be overwritten.
Returns a Promise resolving to the given value or the result of the value function or the resolved value
of the value Promise.
```js
oStore.set(1, {awe: 'some'}).then(...);
```

### `Promise get(Promise|Function|String id)`
Get an object from the store by the given id or null if it does not exist. If `id` is a Function or Promise it
will be called/resolved.
```
oStore.get(1).then(r => r === {awe: 'some'}); // true
```

### `Promise delete(Promise|Function|String id)`
Remove the object with the given id. If `id` is a Function or Promise it
will be called/resolved.
```js
fCache.delete(1).then(...);
```

### `Promise has(String id)`
Map interface method, check if an entry with the given id exists.
```js
fCache.has(id).then(b => b === true || b === false);configurable
```

### Todo
* make object-store a plugin
* add redis adapter/plugin
