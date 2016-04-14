'use strict';

const log = require('util').debuglog('cache');
const co = require('co');
const hash = require('farmhash').fingerprint32;
const ObjectStore = require('./object-store');

const NS_SEPARATOR = ':';

module.exports = class FunctionCache {

	constructor(func, options) {
		if (typeof func !== 'function') {
			throw new Error('Found no function to cache');
		}

		options = Object.assign({}, options);
		this.func = func;
		this.funcHash = hash(func.toString());
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
			log('get with id %s', id);
			let result = yield this.store.get(id);

			if (result) {
				log('found result for id %s', id);
				return result.data;
			}
					
			log('create a new entry for id %s', id);
			result = yield Promise.resolve(this.func.apply(this, args));						
			return this.store.set(id, result);
		}.bind(this));
	}
	
	invalidate(query) {
		log('invalidating cache with query %s', JSON.stringify(query));
		return this.store.model.remove(query);
	}
	
	clear() {
		log('clear cache with namespace %s', this.namespace);
		let id = new RegExp('^' + this.namespace + NS_SEPARATOR + '.*');
		return this.invalidate({id});
	}
	
	getId() {
		let idHash = hash(this.funcHash + JSON.stringify([].slice.call(arguments)));
		return [this.namespace, idHash].join(NS_SEPARATOR);
	}
	
	
}