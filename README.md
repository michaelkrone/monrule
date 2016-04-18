# monrule
A simple cache to persist expensive function results in a mongodb database.

```js
const Cache = require('monrule').FunctionCache;

function calculate(a, b) {
	console.log('calculating ...');
	return a + b;
};

let c = new Cache(calculate);
let f = c.getWrapper();

f(1, 2); // or c.get(1, 2): calculating ... => 3
f(1, 2); // => 3

c.clear(); // clear all cached results
c.invalidate(...); // invalidate cache results based on a query
```

More docs to come
