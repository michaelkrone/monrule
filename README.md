# monrule
A simple cache to persist expensive function results.

```js
const Cache = require('monrule').FunctionCache;

function calculate(a, b) {
	console.log('calculating ...');
	return a + b;
};

let c = new Cache(calculate);
c.get(1, 2); // calculating ... => 3
c.get(1, 2); // => 3
```
