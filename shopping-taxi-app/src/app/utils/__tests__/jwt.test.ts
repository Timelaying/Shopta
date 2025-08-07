import test from 'node:test';
import assert from 'node:assert';
import { parseJwt, isTokenExpired } from '../jwt.ts';

const createToken = (payload: Record<string, unknown>): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
};

test('parseJwt decodes valid JWT payload', () => {
  const payload = { exp: Math.floor(Date.now() / 1000) + 60, name: 'Alice' };
  const token = createToken(payload);
  assert.deepStrictEqual(parseJwt(token), payload);
});

test('parseJwt returns null for malformed token', () => {
  assert.strictEqual(parseJwt('malformed.token'), null);
});

test('isTokenExpired returns false for valid token', () => {
  const payload = { exp: Math.floor(Date.now() / 1000) + 60 };
  const token = createToken(payload);
  assert.strictEqual(isTokenExpired(token), false);
});

test('isTokenExpired returns true for expired token', () => {
  const payload = { exp: Math.floor(Date.now() / 1000) - 60 };
  const token = createToken(payload);
  assert.strictEqual(isTokenExpired(token), true);
});

test('isTokenExpired returns true for malformed token', () => {
  assert.strictEqual(isTokenExpired('malformed.token'), true);
});
