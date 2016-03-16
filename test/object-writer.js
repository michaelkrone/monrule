'use strict';

import test from 'ava';
import mongoose from 'mongoose';
import {spy} from 'sinon';
import {ObjectWriter} from '../lib';

test.cb.before(t => {
	mongoose.connect('mongodb://127.0.0.1/monrule', t.end);
});

test.beforeEach(t => {
	t.context.e = new ObjectWriter();
	t.context.createSpy = spy(t.context.e.model, 'create');
})

test.afterEach(t => {
	t.context.createSpy.restore();
})

test.serial('should write an event into the database', async t => {
	await t.context.e.write('data', 'data');
	t.true(t.context.createSpy.calledOnce);
	t.same(t.context.createSpy.getCall(0).args[0], {id: 'data', event: 'data'});
});

test.serial('should generate an id if none is given', async t => {
	await t.context.e.write('data');
	t.true(t.context.createSpy.calledOnce);	
	t.true(typeof t.context.createSpy.getCall(0).args[0].id === 'string');
});