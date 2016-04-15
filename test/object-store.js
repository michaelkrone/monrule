'use strict';

import test from 'ava';
import mongoose from 'mongoose';
import {ObjectStore} from '../lib';

const options = {mongoose, modelName: 'ObjectStoreTest'};

test.cb.before('connect to database', t => {
	mongoose.connect('mongodb://127.0.0.1/monrule', t.end);
});

test.cb.after('cleanup database', t => {
	const o = new ObjectStore(options);
	o.model.remove({}, t.end);
});

test('should only work with valid arguments', t => {
	t.throws(() => new ObjectStore());
	t.throws(() => new ObjectStore({}));
});

test('should write into the database', async t => {
	let e = new ObjectStore(options);
	let m = await e.set(1, 'data');
	t.is(m, 'data');
});

test('should accept a function as document data', async t => {
	const o = {a: 1, b: 'string'};
	let e = new ObjectStore(options);
	let m = await e.set('object', () => o);
	t.is(m, o);
});

test('should accept a function as id', async t => {
	const o = 'object';
	let e = new ObjectStore(options);
	let m = await e.set(() => 'id', 'object');
	t.is(m, o);
});

test('should accept a promise as document data', async t => {
	let e = new ObjectStore(options);
	let m = await e.set('test', () => new Promise((resolve) => resolve('test')));
	t.is(m, 'test');
});

test('should find the created documents', async t => {
	const id = 'static';
	const o = {a: 1, b: 'string'};
	let e = new ObjectStore(options);
	let m = await e.set(id, o);
	t.deepEqual(m, o);

	let d = await e.get(id);
	t.deepEqual(d, o);
});

test('should find the created documents with an id function', async t => {
	const f = () => 'dynamic';
	const o = {a: 1, b: 'string'};
	let e = new ObjectStore(options);

	await e.set(f, o);
	let d = await e.get(f);
	t.deepEqual(d, o);
});

test('should find the created documents with an id promise', async t => {
	const id = Math.random();
	const f = () => Promise.resolve(id);
	const o = {a: 1, b: 'string'};
	let e = new ObjectStore(options);

	await e.set(f, o);
	let d = await e.get(f);
	t.deepEqual(d, o);
});

test('should remove the created documents', async t => {
	const id = Math.random();
	const o = {a: 1, b: 'string'};
	let e = new ObjectStore(options);

	await e.set(id, o);
	await e.delete(id);

	t.falsy(await e.get(id));
});

test('should remove the created documents with an id promise', async t => {
	const id = Math.random();
	const f = () => Promise.resolve(id);
	const o = {a: 1, b: 'string'};
	let e = new ObjectStore(options);

	await e.set(f, o);
	await e.delete(f);

	t.falsy(await e.get(f));
});

test('should provide a map like `has` method', async t => {
	const id = Math.random();
	const f = () => Promise.resolve(id);
	const o = {a: 1, b: 'string'};
	let e = new ObjectStore(options);

	await e.set(f, o);
	let d = await e.get(f);

	t.deepEqual(d, o);
	t.truthy(await e.has(f));

	await e.delete(f);

	t.falsy(await e.has(f));
});
