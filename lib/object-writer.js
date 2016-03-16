'use strict';

const uuid = require('uuid-v4');
const mongoose = require('mongoose');

module.exports = class EventWriter {

	constructor(options) {
		options = Object.assign({
			schema: new mongoose.Schema({event: mongoose.Schema.Types.Mixed, id: { type: String, index: true } }, {timestamps: true}),
			modelName: 'Event' 
		}, options);
		
		try {
			this.model = mongoose.model(options.modelName, options.schema);
		} catch (e) {
			this.model = mongoose.model(options.modelName);
		}
	}
	
	write(event, id) {
		// use an uuid, to get an id would be the only reason to create a model instance
		id = id || uuid();
		return this.model.create({id, event});
	}
}