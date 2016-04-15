'use strict';

const EventEmitter = require('events').EventEmitter;
const co = require('co');
const FIELDS = {KEY: 0, OPTIONS: 1};

module.exports = class Runner extends EventEmitter {

	constructor(options) {
		super();
		this.options = Object.assign({emit: true, triggerValid: false}, options);
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
		return this;
	}

	/**
	 * Check a specific rule
	 */
	check(rule, args) {
		return co(function* () {
			const data = {
				result: yield Promise.resolve(rule[FIELDS.OPTIONS].rule.apply(null, args)),
				key: rule[FIELDS.KEY],
				rule,
				args
			};

			if (this.options.emit && (!data.result || this.options.triggerValid)) {
				this.emit(data.key, data);
			}

			return data;
		}.bind(this));
	}

	/**
	 * Iterate all rules
	 */
	* iterator() {
		for (let rule of this.map) {
			yield this.check(rule, arguments);
		}
	}

	/**
	 * Check all rules
	 */
	run() {
		for (let rule of this.map) {
			this.check(rule, arguments);
		}
		return this;
	}

	/**
	 * Clear the map and remove all listeners
	 */
	clear() {
		this.map = new Map();
		return this;
	}
};
