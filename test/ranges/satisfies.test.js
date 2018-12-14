import test from 'ava';

import { satisfies } from '../../';

// satisfies(version, range): Return true if the version satisfies the range.

test('satisfies(version, range) - unbounded range', t => {
  t.true(satisfies('0', '(,)'));
  t.true(satisfies('1', '(,)'));
  t.true(satisfies('1.0', '(,)'));
  t.true(satisfies('0.1', '(,)'));
  t.true(satisfies('1-alpha', '(,)'));
  t.true(satisfies('1.0-alpha1', '(,)'));
  t.true(satisfies('1.1.1-FINAL', '(,)'));

  t.true(satisfies('0', '[,]'));
  t.true(satisfies('1', '[,]'));
  t.true(satisfies('1.0', '[,]'));
  t.true(satisfies('1.0', '[,]'));
  t.true(satisfies('1-alpha', '[,]'));
  t.true(satisfies('1.0-alpha1', '[,]'));
  t.true(satisfies('1.1.1-FINAL', '[,]'));
});

test('satisfies(version, range) - nonsensical', t => {
  t.true(satisfies('nonsense', 'nonsense'));
  // oddly enough, the spec says '1.2.1' satisfies 'nonsense'
  // but we break that, because it's not useful
  t.false(satisfies('1.2.1', 'nonsense'));
  t.false(satisfies('nonsense', 'other'));
});

test('satisfies(version, range) - simple', t => {
  t.true(satisfies('1.1', '[1.1,)'));
  t.false(satisfies('1.1.5', '1.1.2'));
  t.false(satisfies('1.1.5', '[1.1.2]'));
  t.true(satisfies('1.1.5', '1.1.5'));
  t.true(satisfies('1.4.11', '[1.3,1.5)'));
  t.true(satisfies('1.2.3', '[1.2,)'));
  t.true(satisfies('1.2.3', '(,1.0],[1.2,)'));
  t.true(satisfies('0.9.0', '(,1.0],[1.2,)'));
  t.false(satisfies('4.2.1', '[2.0.0,3)'));
  t.false(satisfies('1.0', '[1.1,)'));
  t.false(satisfies('1.2', '1.1'));
  t.false(satisfies('1.5.2', '[1.3,1.5)'));
  t.false(satisfies('1.1.8', '(,1.0],[1.2,)'));
});

test('satisfies(version, range) - alpha version', t => {
  t.true(satisfies('2.0.alpha', '[,2.0)'));
  t.true(satisfies('1.0-alpha', '[1-a,2)'));
  t.true(satisfies('1.0-alpha', '[1-alpha,2)'));
  t.true(satisfies('1.0-alpha', '[1-alpha,1)'));
  t.true(satisfies('1.0-alpha', '[1-alpha,1]'));
  t.true(satisfies('2.alpha', '[,2.beta)'));
  t.true(satisfies('3.alpha', '[2,3]'));
  t.true(satisfies('1.0-alpha', '[1.0-alpha,1]'));

  t.false(satisfies('1.0-alpha', '[1,1.0-alpha]'));
  t.false(satisfies('2.alpha', '[2,3]'));
});

test('satisfies(version, range) - alpha, beta, milestone', t => {
  t.true(satisfies('1.0', '[1-a,2)'));
  t.true(satisfies('1.milestone2', '[,1.milestone3]'));
  t.true(satisfies('1.milestone2', '[,1.milestone3)'));
  t.true(satisfies('1.0-beta', '[1-a,2)'));
  t.true(satisfies('1.0-beta', '[1-a,2)'));
  t.true(satisfies('1.0-final', '[1-a,1]'));
  t.true(satisfies('4.3.0.alpha', '[4.1.0,4.3.0]'));
  t.true(satisfies('4.1.0.Final', '[4.1.0,4.3.0]'));

  t.false(satisfies('0.9', '[1-a,2)'));
  t.false(satisfies('2.beta', '[,2.beta)'));
  t.false(satisfies('1.0-final', '[1-a,1)'));
  t.false(satisfies('4.1.0.beta', '[4.1.0,4.3.0]'));
  t.false(satisfies('1.milestone2', '[,1.milestone1]'));
});

test('satisfies(version, range) - final, release', t => {
  t.true(satisfies('2.0.FINAL', '[,2]'));
  t.true(satisfies('2.0', '[,2.0-FINAL]'));
  t.true(satisfies('2', '[,2.0-FINAL]'));
  t.true(satisfies('2.FINAL', '[,2.0-GA]'));
  t.true(satisfies('2.0.0.GA', '[,2.0-FINAL]'));
  t.true(satisfies('2.0.0.RELEASE', '[,2.0-FINAL]'));
  t.true(satisfies('3.2.7.RELEASE', '[3,3.2.9)'));
  t.true(satisfies('4.3.0.GA', '[4.1.0,4.3.0]'));
  t.true(satisfies('4.3.0.Final', '[4.1.0,4.3.0]'));
  t.true(satisfies('4.3.0.RELEASE', '[4.1.0,4.3.0]'));
  t.false(satisfies(
    '4.2.1',
    '[2.0.0,3),[3.0.0.RELEASE,3.1),[3.1.0.RELEASE,3.2)'));
  t.false(satisfies('4.2.1.RELEASE', '(4.1.0.RELEASE,4.2.0.RELEASE)'));
  t.false(satisfies('4.3.0.GA', '[4.1.0,4.3.0)'));
  t.false(satisfies('4.0.9.RELEASE', '[3,3.0.6)'));
});

test('satisfies(version, range) - security', t => {
  t.false(satisfies('4.0.9.RELEASE', '[,2.5.6.SEC03)'));
  t.false(satisfies('4.0.9.RELEASE', '[,2.5.6.REC03)'));
  t.false(satisfies('4.0.9.RELEASE', '[2.5.7,2.5.7.SR023)'));
  t.false(satisfies(
    '4.0.9.RELEASE',
    '[,2.5.6.SEC03), [2.5.7,2.5.7.SR023), [3,3.0.6)'));
  t.true(satisfies('2.5', '[2.5,2.5.6.SEC02)'));
  t.true(satisfies('2.5.6.SEC01', '[2.5,2.5.6.SEC02)'));
  t.false(satisfies('2.5.6.SEC02', '[2.5,2.5.6.SEC02)'));
  t.false(satisfies('2.5.6.SECURITY01', '[2.5,2.5.6.SEC02)'));
  t.false(satisfies('2.5-SNAPSHOT', '[2.5,2.5.6.SEC02)'));
  t.true(satisfies('2.5-SNAPSHOT', '[2.5-alpha,2.5.6.SEC02)'));
  t.true(satisfies('2.5.6-SNAPSHOT', '[2.5,2.5.6.SEC02)'));
});
