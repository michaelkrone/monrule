'use strict';

import test from 'ava';
import {spy} from 'sinon';
import {RuleRunner} from '../lib';

test('should throw for an invalid rule config', t => {
	const rr = new RuleRunner();	
	t.throws(() => rr.register());
	t.throws(() => rr.register(null, {a: 1}));
	t.throws(() => rr.register({rule: {}}));
	t.throws(() => rr.register('test', {rule: 1}));
});

test('should check a rule', async t => {
	const rr = new RuleRunner();
	const rule = (a, b) => a > b;
	const ruleConf = [undefined, {key: rule, rule}];

	let result = await rr.check(ruleConf, 1, 2);
	t.false(result.valid);
	
	result = await rr.check(ruleConf, 2, 1);
	t.true(result.valid);
});

test('should register and iterate the rules', async t => {
	const rr = new RuleRunner();	
	const rule = (a, b) => a > b;
	const elur = (a, b) => a < b;

	rr.register(rule, {rule});
	rr.register(elur, {rule: elur});

	for (let p of rr.iterate(1, 2)) {
		let r = await p;
		if (r === rule) {
			t.false(r.valid);
		}
		
		if (r === elur) {
			t.true(r.valid);
		}
	}
	
	for (let p of rr.iterate(2, 1)) {
		let r = await p;
		if (r === rule) {
			t.true(r.valid);
		}
		
		if (r === elur) {
			t.false(r.valid);
		}
	}
});

test.cb('should emit an event on failed validation', t => {
	const rr = new RuleRunner();
	const rule = (a, b) => a > b;
	
	rr.register('test', {rule});
		
	rr.on('test', (result) => {
		t.false(result.valid);
		t.end();
	});
	
	rr.run(1, 2);
});

test.cb('should not emit an event on suceeded validation by default', t => {
	const rr = new RuleRunner();
	const rule = (a, b) => a > b;
	const eventSpy = spy();

    rr.on('test', eventSpy);
	rr.register('test', {rule});
	
	setTimeout(() => {
      t.false(eventSpy.called);
      t.end();
    });
	
	rr.run(2, 1);
});

test.cb('should emit an event on suceeded validation if I told her so', t => {
	const rr = new RuleRunner({triggerValid: true});
	const rule = (a, b) => a > b;
	
	rr.register('test', {rule});
	rr.run(2, 1);
	
	rr.on('test', (result) => {
		t.true(result.valid);
		t.end();
	});	
});
