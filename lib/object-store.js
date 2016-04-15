'use strict';

const log = require('util').debuglog('store');
const co = require('co');

module.exports = class ObjectStore {

	constructor(options) {
		if (!options || !options.mongoose) {
			throw new Error('No mongoose instance passed in the options');
		}

		const mongoose = options.mongoose;
		options = Object.assign({modelName: 'ObjectBucket'}, options);

		try {
			this.model = mongoose.model(options.modelName);
			log('got initialized model %s', options.modelName);
		} catch (e) {
			let schema = new mongoose.Schema(
				{
					_id: {type: String, index: true, required: true},
					data: mongoose.Schema.Types.Mixed
				}, {
					timestamps: true,
					validateBeforeSave: false,
					versionKey: false,
					strict: false,
					minimize: false
				});

			log('register new model %s', options.modelName);
			this.model = mongoose.model(options.modelName, schema);
		}
	}

	set(_id, data) {
		return co(function* () {
			if (typeof _id === 'function') {
				_id = yield Promise.resolve(_id());
			}

			if (typeof data === 'function') {
				data = yield Promise.resolve(data());
			}

			log('store object for _id %s', _id);
			yield this.model.findByIdAndUpdate(_id, {data}, {upsert: true}).exec();
			return data;
		}.bind(this));
	}

	get(_id) {
		return co(function* () {
			if (typeof _id === 'function') {
				_id = String(yield Promise.resolve(_id()));
			}

			log('read object with _id %s', _id);
			let result = yield this.model.findById(_id).exec();
			return result ? result.data : null;
		}.bind(this));
	}

	delete(_id) {
		return co(function* () {
			if (typeof _id === 'function') {
				_id = yield Promise.resolve(_id());
			}

			log('remove object with _id %s', _id);
			return this.model.remove({_id});
		}.bind(this));
	}

	has(_id) {
		return co(function* () {
			return Boolean(yield this.get(_id));
		}.bind(this));
	}
};
