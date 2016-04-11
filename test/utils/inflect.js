'use strict';

import test from 'ava';
import {inflect} from '../../lib/utils';

test.beforeEach(t => {
	t.context.theObject = {unique: true, awesome: () => {}};
	t.context.theName = 'Hulk';
	t.context.theNumber = 42;
	
	const keymap = {
		aName: 'name',
		anObject: 'object',
		missing: 'missing'
	};

	t.context.remapped = {
		aName: t.context.theName,
		anAge: t.context.theNumber,
		anObject: t.context.theObject
	};
	
	inflect(t.context.remapped, keymap);
});

test('should still be an object', t => {
	t.ok(typeof t.context.remapped === 'object');
});

test('should sensibly remap keys', t => {
	t.ok(t.context.remapped.name);
	t.ok(t.context.remapped.object);
	t.ok(t.context.remapped.anAge);
	t.notOk(t.context.remapped.aName);
});

test('should not map missing keys', t => {
	t.notOk(t.context.remapped.missing);
});

test('should have set the proper values', t => {
	t.same(t.context.remapped.name, t.context.theName);
	t.same(t.context.remapped.anAge, t.context.theNumber);
	t.same(t.context.remapped.object, t.context.theObject);
});

test('should do nothing when no map is given', t => {
	const obj = {a: 1};
	inflect(obj, undefined)
	t.ok(obj.a);
});

test('should do nothing on an empty map', t => {
	const obj = {a: 1};
	inflect(obj, Object.create(null));
	t.ok(obj.a);
});

test('should not whine on quirky values', t => {
	t.notThrows(() => inflect(undefined, undefined));
	t.notThrows(() => inflect(null, {}));
	t.notThrows(() => inflect(null, 3));
});