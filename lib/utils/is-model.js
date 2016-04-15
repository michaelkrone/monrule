'use strict';

module.exports = isModel;

/**
 * Checks if the passed argument is a mongoose model instance.
 * @params {*} model The argument to check
 * @returns {Boolean} True if the passed argument is a mongoose model, otherwise false
 */
function isModel(model) {
	return Boolean(model && model.prototype && model.prototype.constructor.name === 'model');
}
