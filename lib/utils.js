'use strict';

module.exports = {
	inflect
};

function inflect(obj, map) {
	if (!map) {
		return obj;
	}
	
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop) && prop in map) {
			obj[map[prop]] = obj[prop];
			delete obj[prop];
		}
	}
}