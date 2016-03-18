'use strict';

const co = require('co');

module.exports = class ObjectWriter {

	constructor(options) {
		if (!ObjectWriter.isModel(options) && !options.mongoose) {
			throw new Error('No mongoose instance passed in the options');
		}
						
		if (ObjectWriter.isModel(options)) {
			this.model = options;
			return;
		}
		
		this.defaultSchema = !options.schema
		
		const mongoose = options.mongoose;
		const schema = options.schema || new mongoose.Schema(
			{data: mongoose.Schema.Types.Mixed},
			{timestamps: true}
		);
		
		options = Object.assign({modelName: 'ObjectBucket', schema}, options);
		
		try {
			this.model = mongoose.model(options.modelName);
		} catch (e) {
			this.model = mongoose.model(options.modelName, schema);
		}
	}
	
	static isModel(model) {
		return model.prototype && model.prototype.constructor.name === 'model';
	}
	
	write(data) {
		return co(function* () {
			if (typeof data === 'function') {
				data = ( yield [data()] )[0];
			}
			return this.model.create(this.defaultSchema ? {data} : data);
		}.bind(this));
	}
}