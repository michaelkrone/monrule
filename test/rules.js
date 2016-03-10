'use strict';

import test from 'ava';
import { Validator } from '../lib';

test.beforeEach(t => {
	t.context.v = new Validator();
});

test('should throw for an invalid rule config', t => {
	t.throws(() => t.context.v.register());
	t.throws(() => t.context.v.register({a: 1}));
	t.throws(() => t.context.v.register({rule: {}}));
	t.throws(() => t.context.v.register('test', {rule: 1}));
});

test('should check a rule', async t => {
	const rule = (a, b) => a > b;
	const ruleConf = [undefined, {key: rule, rule}];

	let result = await t.context.v.check(ruleConf, 1, 2);
	t.false(result.valid);
	
	result = await t.context.v.check(ruleConf, 2, 1);
	t.true(result.valid);
});

test('should register and iterate the rules', async t => {
	const rule = (a, b) => a > b;
	t.context.v.register(rule, {rule});

	for (let p of t.context.v.iterate(1, 2)) {
		let r = await p;
		t.is(1, r.a);
		t.is(2, r.b);
		t.false(r.valid);
	}
	
	for (let p of t.context.v.iterate(2, 1)) {
		let r = await p;
		t.is(2, r.a);
		t.is(1, r.b);
		t.true(r.valid);
	}
});

test.skip('should emit an event on failed validation', t => {
	const rule = (a, b) => a > b;
	t.plan(1);
	
	t.context.v.register('test', {rule});
	t.context.v.on('test', (key, result) => {
		t.is(key, 'test');
		t.false(result.valid);
		t.pass()
		t.end();
	});
	
	t.context.v.checkAll(1, 2);
});