# monrule
A simple cache to persist expensive function results in a mongodb database.

```js
const Cache = require('monrule').FunctionCache;
const mongoose = require('mongoose');

function calculate(a, b) {
	console.log('calculating ...');
	return a + b;
};

let c = new Cache(calculate, {mongoose});
let f = c.getWrapper();

f(1, 2); // or c.get(1, 2): calculating ... => 3
f(1, 2); // => 3

c.clear(); // clear all cached results
c.invalidate({data: 3}); // invalidate cache results based on a query
```

## FunctionCache API

### Options

`mongoose`: A mongoose instance used to communicate with the database

`[modelName]`: Name of the model to store the results with, defaults to 'ObjectBucket'

`[namespace]`: A prefix for the id, will be used to invalidate all objects with this prefix, defaults to 'FunctionCache'

`[resolver]`: A function that is called for every id generation with the arguments of the cached function. This is
usefull if only a fraction of the arguments should be considered for generating an object id

```
const FunctionCache = require('monrule').FunctionCache;
const options = {mongoose: require('mongoose')};
const fCache = new FunctionCache(aFunction, options);
```

### `get(arguments)`
Calls the wrapped function and looks up a cached result for the given arguments. If no cache result can be found the
wrapped function is called and the result is cached in the database and returned.
```
f.get(a, b, c);
```

### `getWrapper()`
Returns the wrapped function to work with the cache like a normal function. Calls the `get` method with the correct
class bound to `this`.
```
const f = fCache.getWrapper();
f(a, b, c);
```

### `clear()`
Clears the cache and removes all entries with the namespace set in the options. If no namespace has been
set, the default namespace will be used.
```
fCache.clear().then(...);
```

### `invalidate(queryObject)`
Invalidate (read: remove) all results that match the query object. Note that the cached data is per default saved as
a `data` object, so you might prefix your queries accordingly.
```
fCache.invalidate({'data.prop': dataValue}).then(...);
```

### static `getId(a, b, c, ...)`
Generate a hash for the iven arguments, if a resolver function is given in the options the resolver is called
with the given arguments and the result of the function call is used to generate a hash.
```
FunctionCache.getId(a, b, c);
```

## ObjectStore API

### Options

`mongoose`: A mongoose instance used to communicate with the database

`[modelName]`: Name of the model to store the results with, defaults to 'ObjectBucket'
If no such model has been registered, a standard model will be used.

```
const ObjectStore = require('monrule').ObjectStore;
const options = {mongoose: require('mongoose')};
const oStore = new ObjectStore(options);
```

### `set(id, value)`
Set a value in the store with the given id. If a value with this id exists it will be overwritten.
```
oStore.set(1, {awe: 'some'}).then(...);
```

### `get(id)`
Get an object from the store by the given id or null if it does not exist.
```
oStore.get(1).then(r => r === {awe: 'some'}); // true
```

### `delete(id)`
Remove the object with the given id
```
fCache.delete(1).then(...);
```

### `has(id)`
Map interface method, check if an entry with the given id exists.
```
fCache.has(id).then(b => b === true || b === false);
```