'use strict';

const co = require('co');
const uuid = require('uuid-v4');
const mongoose = require('mongoose');

module.exports = class ObjectWriter {

	constructor(options) {
		options = Object.assign({
			schema: new mongoose.Schema({object: mongoose.Schema.Types.Mixed, id: { type: String, index: true } }, {timestamps: true}),
			modelName: 'ObjectBucket' 
		}, options);
		
		try {
			this.model = mongoose.model(options.modelName, options.schema);
		} catch (e) {
			this.model = mongoose.model(options.modelName);
		}
	}
	
	write(object, id) {
		return co(function* () {			
			if (typeof object === 'function') {
				object = ( yield [object()] )[0];
			}
			
			if (typeof id === 'function') {
				id = ( yield [id()] )[0];
			}
			
			// use an uuid, to get an id would be the only reason to create a model instance
			id = id || uuid();
			
			return this.model.create({id, object});
		}.bind(this));
	}
}