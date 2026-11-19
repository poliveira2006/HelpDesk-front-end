import test from 'node:test';
import assert from 'node:assert/strict';
import { isStaff } from '../src/permissions.js';

test('isStaff reconhece admin e analista', () => {
  assert.equal(isStaff({ perfil: 'admin' }), true);
  assert.equal(isStaff({ perfil: 'analista' }), true);
});

test('isStaff rejeita solicitante, nulo e perfis desconhecidos', () => {
  assert.equal(isStaff({ perfil: 'usuario' }), false);
  assert.equal(isStaff({ perfil: 'Admin' }), false);
  assert.equal(isStaff({}), false);
  assert.equal(isStaff(null), false);
  assert.equal(isStaff(undefined), false);
});
