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
c.invalidate(...); // invalidate cache results based on a query
```
### Options

*mongoose*: A mongoose instance

*modelName*: Name of the model to store the results with

*namespace*: A prefix for the id, will be used to invalidate all objects with this prefix

*resolver*: A function that is called for every id generation with the arguments of the cached function. This is
usefull if only a fraction of the arguments should be considered for generating an object id