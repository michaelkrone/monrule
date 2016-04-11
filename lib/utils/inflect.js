'use strict';

module.exports = inflect;

/**
 * Remap object properties.
 * @params {Object} obj The object to remap (mutates the object)
 * @params {Object} map The property map to use, containts oldPropertyName: newPropertyName values
 */
function inflect(obj, map) {
	if (!map) {
		return;
	}
	
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop) && prop in map) {
			obj[map[prop]] = obj[prop];
			delete obj[prop];
		}
	}
}