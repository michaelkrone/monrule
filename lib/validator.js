'use strict';

const co = require('co');

module.exports = class Validator extends require('events').EventEmitter {
	
	constructor(options) {
		super();
		this.options = Object.assign({}, options);
		this.map = new Map();
	}
}
