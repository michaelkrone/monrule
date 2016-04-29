'use strict';

import test from 'ava';
import {stub} from 'sinon';
import mongoose from 'mongoose';
import {FunctionCache} from '../lib';

const opts = {mongoose, modelName: 'FunctionCacheTest'};

test.cb.before('connect to database, drop the whole thing', t => {
	mongoose.connect('mongodb://127.0.0.1/monrule', () => {
		mongoose.connection.db.dropDatabase(t.end);
	});
});

test.cb.after('cleanup databse', t => {
	mongoose.model(opts.modelName).remove({}, t.end);
});

test('should only work with valid arguments', t => {
	t.throws(() => new FunctionCache());
	t.throws(() => new FunctionCache({}, opts));
});

test('should accept a function', t => {
	t.notThrows(() => new FunctionCache(() => true));
});

test('should cache a function', async t => {
	const r = stub();
	r.returns({foo: true});

	const c = new FunctionCache(r, opts);

	await c.get(1);
	await c.get(1);
	t.true(r.calledOnce);
});

test('should provide a simple cache wrapper function', async t => {
	const r = stub();
	r.returns(1);

	const c = new FunctionCache(r, opts);
	const f = c.getWrapper();

	await f(1, 2);
	await f(1, 2);
	t.true(r.calledOnce);

	await f(1, 1);
	await f(1, 1);
	t.true(r.calledTwice);

	await f(1, '1');
	await f(1, '1');
	t.true(r.calledThrice);
});

test('should create sensible ids for the arguments of the cached function', async t => {
	const r = (a, b) => a + b;
	const o = {namespace: 'stored-objects', mongoose, modelName: 'FunctionCacheTest'};
	const c = new FunctionCache(r, o);

	let id1 = c.getId(1, 2);
	let id2 = c.getId(2, 1);
	t.false(id1 === id2);

	id1 = c.getId([{a: 1, b: 2}]);
	id2 = c.getId([{a: 2, b: 1}]);
	t.false(id1 === id2);

	id1 = c.getId({a: 1, b: 2});
	id2 = c.getId({a: 1, b: 2});
	t.true(id1 === id2);
});

test('should clear all stored objects', async t => {
	const r = stub();
	r.returns(true);

	const namespace = 'stored-objects';
	const o = {namespace, mongoose, modelName: 'FunctionCacheTest'};
	const c = new FunctionCache(r, o);

	await c.get();
	await c.get();
	t.true(r.calledOnce);

	await c.clear();
	await c.get();

	t.true(r.calledTwice);
});

test('should invalidate the cache with a query', async t => {
	const r = stub();
	r.returns({prop: 'value'});

	const o = {namespace: 'stored-objects', mongoose, modelName: 'FunctionCacheTest'};
	const c = new FunctionCache(r, o);

	await c.get();
	await c.get();
	await c.invalidate({'data.prop': 'value'});

	await c.get();
	t.true(r.callCount <= 2);
});
