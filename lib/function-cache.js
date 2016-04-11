'use strict';

const crypto = require('crypto');
const co = require('co');
const hash = require('object-hash');
const ObjectStore = require('./object-store');

const NS_SEPERATOR = ':';

module.exports = class FunctionCache {

	constructor(func, options) {
		if (typeof func !== 'function') {
			throw new Error('Found no function to cache');
		}
		
		
		options = Object.assign({}, options);
				
		this.func = func;
		this.namespace = options.namespace || crypto.randomBytes(20).toString('hex');
		this.store = new ObjectStore({
			mongoose: options.mongoose || require('mongoose'),
			modelName: options.modelName || this.namespace
			});
	}
	
	get() {
		const args = arguments; 
		const id = this.getId(args);
		
		return co(function* () {
			let result = yield this.store.get(id);
			
			if (result) {
				return result.data;
			}
			
			result = yield Promise.resolve(this.func.apply(null, args));
			this.store.set(id, result);
			
			return result;
		}.bind(this));
	}
	
	invalidate(id) {
		return co(function* () {
			return this.store.delete(id); 	
		}.bind(this));
	}
	
	clear() {
		require('mongoose').set('debug', true)
		let id = new RegExp(this.namespace + NS_SEPERATOR + '.*')
		return this.store.model.remove({id});
	}
	
	getId(args) {
		return [this.namespace, hash([].slice.call(args))].join(NS_SEPERATOR);
	}
}