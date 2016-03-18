'use strict';

import test from 'ava';
import mongoose from 'mongoose';
import {ObjectWriter} from '../lib';

test.cb.before(t => {
	mongoose.connect('mongodb://127.0.0.1/monrule', t.end);
});

test('should write into the database', async t => {
	let e = new ObjectWriter({mongoose});
	let m = await e.write('data');
	t.is(m.data, 'data');
});

test('should accept a function as document data', async t => {
	const o = {a: 1, b: 'string'};
	let e = new ObjectWriter({mongoose});
	let m = await e.write(() => o);
	t.same(m.data, o);
});

test('should accept a promise as document data', async t => {
	let e = new ObjectWriter({mongoose});
	let m = await e.write(() => new Promise((r, e) => r('test')));	
	t.same(m.data, 'test');
});

test('should take a model to write into the database', async t => {
	const model = mongoose.model('SaltyBucket', new mongoose.Schema({s: String, n: Number}));
	let o = {s: 'a', n: 1};
	let e = new ObjectWriter(model);
	let m = await e.write(o);
	t.same(m.s, o.s);
	t.same(m.n, o.n);
});
