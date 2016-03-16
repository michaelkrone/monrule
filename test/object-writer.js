'use strict';

import test from 'ava';
import mongoose from 'mongoose';
import {ObjectWriter} from '../lib';

test.cb.before(t => {
	mongoose.connect('mongodb://127.0.0.1/monrule', t.end);
});

test('should write an event into the database', async t => {
	let e = new ObjectWriter();
	let m = await e.write('data', 'data');
	t.is(m.object, 'data');
	t.is(m.id, 'data');
});

test('should generate an id if none is given', async t => {
	let e = new ObjectWriter();
	let m = await e.write('data');
	t.is(m.object, 'data');	
	t.true(typeof m.id === 'string');
});

test('should accept a function as event data', async t => {
	let e = new ObjectWriter();
	let m = await e.write(() => 'test', 'data');	
	t.true(m.object === 'test');
});

test('should accept a function as id', async t => {
	let e = new ObjectWriter();
	let m = await e.write('data', () => 'test');	
	t.true(m.id === 'test');
});