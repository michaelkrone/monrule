'use strict';

const co = require('co');
const FIELDS = {KEY: 0, OPTIONS: 1};

module.exports = class RuleRunner extends require('events').EventEmitter {
	
	constructor(options) {
		super();
		this.options = Object.assign({triggerValid: false}, options);
		this.map = new Map();
	}
	
	/**
	 * Register a rule object {rule: function|Promise}
	 */
	register(key, obj) {
		if (!key || !obj || typeof obj.rule !== 'function') {
			throw new Error('Invalid rule configuration');
		}
		
		this.map.set(key, obj);
	}
	
	/**
	 * Check a specific rule
	 */
	check(rule, a, b) {
		return co(function* () {
			const options = rule[FIELDS.OPTIONS];
			const result = {
				valid: (yield [options.rule(a, b)])[0],
				key: rule[FIELDS.KEY],
				options,
				a,
				b
			};
			
			if (!result.valid || this.options.triggerValid) {
				this.emit(result.key, result);
			}
			
			return result;
		}.bind(this));
	}
		
	/**
	 * Iterate all rules
	 */
	* iterate(a, b) {
		for (let rule of this.map) {
			yield this.check(rule, a, b);
		}
	}
	
	/**
	 * Check all rules
	 */
	run(a, b) {
		for (let rule of this.map) {
			this.check(rule, a, b);
		}
	}
}
