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
	let res = await c.invalidate({'data.prop': 'value'});
	t.truthy(res.result.ok);

	await c.get();
	t.true(r.callCount <= 2);
});

test.cb('should return a promise when called invalidate', t => {
	const r = stub();
	r.returns({prop: 'value'});

	const o = {namespace: 'stored-objects', mongoose, modelName: 'FunctionCacheTest'};
	const c = new FunctionCache(r, o);
	c.invalidate({'data.prop': 'value'}).then(res => {
		t.truthy(res.result.ok);
		t.end();
	});
});

test('should invalidate the cache within its namespace', async t => {
	const r1 = stub();
	const r2 = stub();
	r1.returns({prop: 'value'});
	r2.returns({prop: 'value'});

	const o1 = {namespace: 'stored-objects', mongoose, modelName: 'FunctionCacheTest'};
	const c1 = new FunctionCache(r1, o1);

	const o2 = {namespace: 'different-namespace', mongoose, modelName: 'FunctionCacheTest'};
	const c2 = new FunctionCache(r2, o2);

	await c1.get();
	await c1.get();
	await c2.get();
	await c2.get();
	await c1.invalidate({'data.prop': 'value'});

	await c1.get();
	t.true(r1.callCount <= 2);
	await c2.get();
	t.true(r2.callCount === 1);
});
