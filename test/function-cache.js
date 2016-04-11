'use strict';

import test from 'ava';
import {spy} from 'sinon';
import mongoose from 'mongoose';
import {FunctionCache} from '../lib';

test.cb.before(t => {
	mongoose.connect('mongodb://127.0.0.1/monrule', t.end);
});

test.cb.after(t => {
	const c = new FunctionCache(() => null, {mongoose});
	c.store.model.remove({}, t.end);
});

test('should only work with valid arguments', t => {
	t.throws(() => new FunctionCache());
	t.throws(() => new FunctionCache({}, {mongoose}));
});

test('should accept a function', t => {
	t.notThrows(() => new FunctionCache(() => true));
});

test('should cache a function', async t => {
	const r = Math.random;
	const c = new FunctionCache(r);
	t.same(await c.get(), await c.get());
});

test('should clear all stored objects', async t => {
	const r = () => true;
	const namespace = 'stored-objects';
	const c = new FunctionCache(r, {namespace});

	c.store.model.remove = spy();
	c.clear();

	let stringArg = '' + c.store.model.remove.getCall(0).args[0].id;
	t.true(stringArg.indexOf(namespace) > -1);
});
