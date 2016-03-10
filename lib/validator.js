'use strict';

const co = require('co');

class Validator extends require('events').EventEmitter {

	constructor(options) {
		super();
		this.options = Object.assign({triggerValid: false}, options);
		this.map = new Map();
	}
	
	/**
	 * Register a rule object {rule: function|Promise}
	 */
	register(key, obj) {
		if (!key || !obj || !obj.rule || typeof obj.rule !== 'function') {
			throw new Error('Invalid rule configuration');
		}
		
		this.map.set(key, obj);
	}
	
	/**
	 * Check a specific rule
	 */
	check(ruleConf, a, b) {
		return co(function* () {
			const options = ruleConf[1];
			let valid = (yield [options.rule(a, b)])[0];
			let result = {valid, key: ruleConf[0], a, b, options};
			
			if (this.options.triggerValid || !valid) {
				this.emit(ruleConf[0], result);
			}
			
			return result;
		}.bind(this));
	}
		
	/**
	 * Check all rules
	 */
	* iterate(a, b) {
		for (let rule of this.map) {
			yield this.check(rule, a, b);
		}
	}
	
	/**
	 * Check all rules
	 */
	checkAll(a, b) {
		for (let rule of this.map) {
			this.check(rule, a, b);
		}
	}
}

module.exports = Validator;