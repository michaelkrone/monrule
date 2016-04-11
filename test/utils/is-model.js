'use strict';

import test from 'ava';
import mongoose from 'mongoose';
import {isModel} from '../../lib/utils';

test('should export a function', t => {
	t.ok(typeof isModel === 'function');
});

test('should identify a mongoose model', t => {
	const model = mongoose.model('SaltyBucket', new mongoose.Schema({}));
	t.true(isModel(model));
});

test('should not identify other objects', t => {
	t.false(isModel({}));
	t.false(isModel(null));
	t.false(isModel(Object.create(null)));
	t.false(isModel(1));
	t.false(isModel(new mongoose.Schema({})));
});
