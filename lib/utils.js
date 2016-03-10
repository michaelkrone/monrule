'use strict';

module.exports = {
	inflect
};

function inflect(obj, map) {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop) && prop in map) {
			obj[map[prop]] = obj[prop];
			delete obj[prop];
		}
	}
}