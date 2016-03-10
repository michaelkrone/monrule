'use strict';

import test from 'ava';
import {inflect} from '../lib/utils';

test.beforeEach(t => {
	t.context.theObject = {unique: true};
	
	const keymap = {
		aName: 'name',
		anObject: 'object',
		missing: 'missing'
	};

	t.context.remapped = {
		aName: 'Trevor',
		anAge: 42,
		anObject: t.context.theObject
	};
	
	inflect(t.context.remapped, keymap);
});

test('should return an object', t => {
	t.ok(typeof t.context.remapped === 'object');
});

test('should remap keys', t => {
	t.ok(t.context.remapped.name);
	t.ok(t.context.remapped.object);
	t.ok(t.context.remapped.anAge);
	t.notOk(t.context.remapped.Name);
});

test('should have set the proper values', t => {
	t.same(t.context.remapped.name, 'Trevor');
	t.same(t.context.remapped.anAge, 42);
	t.same(t.context.remapped.object, t.context.theObject);
});

test('should not map missing keys', t => {
	t.notOk(t.context.remapped.missing);
});