'use strict';

import test from 'ava';
import {spy} from 'sinon';
import {Runner} from '../lib';

test('should throw for an invalid rule config', t => {
	const rr = new Runner();
	t.throws(() => rr.register());
	t.throws(() => rr.register(null, {a: 1}));
	t.throws(() => rr.register({rule: {}}));
	t.throws(() => rr.register('test', {rule: 1}));
});

test('should check a rule', async t => {
	const rr = new Runner();
	const rule = (a, b) => a > b;
	const conf = [rule, {rule}];

	let data = await rr.check(conf, [1, 2]);
	t.false(data.result);

	data = await rr.check(conf, [2, 1]);
	t.true(data.result);
});

test('should check a promise as a rule', async t => {
	const rr = new Runner();
	const rule = (a, b) => new Promise((resolve) => resolve(a > b));
	const conf = [rule, {rule}];

	let data = await rr.check(conf, [1, 2]);
	t.false(data.result);

	data = await rr.check(conf, [2, 1]);
	t.true(data.result);
});

test('should register and iterate the rules', async t => {
	const rr = new Runner();
	const rule = (a, b) => new Promise((resolve) => resolve(a > b));
	const elur = (a, b) => a < b;

	rr.register(rule, {rule})
		.register(elur, {rule: elur});

	for (let p of rr.iterator(1, 2)) {
		let r = await p;
		if (r === rule) {
			t.false(r.result);
		}

		if (r === elur) {
			t.true(r.result);
		}
	}

	for (let p of rr.iterator(2, 1)) {
		let r = await p;
		if (r === rule) {
			t.true(r.result);
		}

		if (r === elur) {
			t.false(r.result);
		}
	}
});

test.cb('should emit an event on failed validation', t => {
	const rr = new Runner();
	const rule = () => false;

	rr.on('test', (data) => {
		t.false(data.result);
		t.end();
	});

	rr.register('test', {rule})
		.run(1, 2);
});

test.cb('should not emit an event on suceeded validation by default', t => {
	const rr = new Runner();
	const rule = () => true;
	const eventSpy = spy();

	rr.on('test', eventSpy);

	setTimeout(() => {
		t.false(eventSpy.called);
		t.end();
	});

	rr.register('test', {rule}).run(2, 1);
});

test.cb('should emit an event on suceeded validation if I told her so', t => {
	const rr = new Runner({triggerValid: true});
	const rule = () => true;

	rr.on('test', (data) => {
		t.true(data.result);
		t.end();
	});

	rr.register('test', {rule}).run(2, 1);
});

test.cb('should not emit at all if the emit option is set to false', t => {
	const rr = new Runner({emit: false});
	const rule = () => false;
	const elur = () => true;
	const eventSpy = spy();

	rr.on('false', eventSpy);
	rr.on('true', eventSpy);

	setTimeout(() => {
		t.false(eventSpy.called);
		t.end();
	});

	rr.register('false', {rule})
		.register('true', {rule: elur})
		.run(2, 1);
});

test.cb('should clear all rules', t => {
	const rr = new Runner();
	const rule = () => false;
	const elur = () => true;
	const eventSpy = spy();

	rr.on('false', eventSpy);
	rr.on('true', eventSpy);

	setTimeout(() => {
		t.false(eventSpy.called);
		t.end();
	});

	rr.register('false', {rule})
		.register('true', {rule: elur})
		.clear()
		.run(2, 1);
});
