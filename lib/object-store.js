'use strict';

const co = require('co');
const isModel = require('./utils').isModel;

module.exports = class ObjectStore {

	constructor(options) {
		if (!options || !options.mongoose) {
			throw new Error('No mongoose instance passed in the options');
		}
				
		const mongoose = options.mongoose;		
		options = Object.assign({modelName: 'ObjectBucket'}, options);
		
		try {
			this.model = mongoose.model(options.modelName);
		} catch (e) {
			this.model = mongoose.model(
				options.modelName,
				new mongoose.Schema({
						id: {type: String, index: true, required: true},
						data: mongoose.Schema.Types.Mixed
					}, {timestamps: true})
			);
		}
	}
	
	set(id, data) {
		return co(function* () {
			if (typeof id === 'function') {
				id = yield Promise.resolve(id());
			}
			
			if (typeof data === 'function') {
				data = yield Promise.resolve(data());
			}
			
			return this.model.create({id, data});
		}.bind(this));
	}
	
	get(id) {
		return co(function* () {
			if (typeof id === 'function') {
				id = yield Promise.resolve(id());
			}

			return  this.model.findOne({id});
		}.bind(this));
	}
			
	delete(id) {
		return co(function* () {
			if (typeof id === 'function') {
				id = yield Promise.resolve(id());
			}
			
			return this.model.remove({id});
		}.bind(this));
	}
		
	has(id) {
		return co(function* () {
			return !!( yield this.get(id) );
		}.bind(this));
	}
}
