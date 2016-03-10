'use strict';

import test from 'ava';
import {inflect} from '../lib/utils';

test.beforeEach(t => {
	const keymap = {
		Name: 'name',
		Age: 'age',
		missing: 'missing'
	};

	t.context.remapped = {
		Name: 'Trevor',
		Age: 28
	};
	
	inflect(t.context.remapped, keymap);
});

test('should return an object', t => {
	t.ok(typeof t.context.remapped === 'object');
});

test('should map keys from obj->keymap', t => {
	t.ok(t.context.remapped.name);
	t.ok(t.context.remapped.age);
	t.notOk(t.context.remapped.Name);
	t.notOk(t.context.remapped.Age);
});

test('should ignore missing keys', t => {
	t.notOk(t.context.remapped.missing);
});