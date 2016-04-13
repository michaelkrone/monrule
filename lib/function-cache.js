'use strict';

const co = require('co');
const hash = require('farmhash').hash32;
const ObjectStore = require('./object-store');

const NS_SEPARATOR = ':';

module.exports = class FunctionCache {

	constructor(func, options) {
		if (typeof func !== 'function') {
			throw new Error('Found no function to cache');
		}
				
		options = Object.assign({}, options);
		this.func = func;
		this.funcHash = func.toString();
		this.namespace = '' + (options.namespace || 'FunctionCache');
		this.store = options.store || new ObjectStore({
			mongoose: options.mongoose || require('mongoose'),
			modelName: options.modelName || this.namespace
		});
	}
	
	getWrapper() {
		return this.get.bind(this);
	}
	
	get() {
		const args = arguments;
		const id = this.getId(arguments);

		return co(function* () {
			let result = yield this.store.get(id);

			if (result) {
				return result.data;
			}

			result = yield Promise.resolve(this.func.apply(this, args));
			this.store.set(id, result);
			
			return result;
		}.bind(this));
	}
	
	invalidate(query) {
		return this.store.model.remove(query);
	}
	
	clear() {
		let id = new RegExp('^' + this.namespace + NS_SEPARATOR + '.*');
		return this.invalidate({id});
	}
	
	getId() {
		let idHash = hash(this.funcHash + JSON.stringify([].slice.call(arguments)));
		return [this.namespace, idHash].join(NS_SEPARATOR);
	}
}