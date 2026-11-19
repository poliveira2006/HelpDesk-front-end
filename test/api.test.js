import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE, fmt, qs } from '../src/api.js';

test('BASE cai no localhost quando VITE_API_URL não existe', () => {
  assert.equal(BASE, 'http://localhost:3000/api/v1');
});

test('qs remove vazios, null e false e mantém zero/true', () => {
  const s = qs({
    titulo: 'erro',
    numero: '',
    status: null,
    semPrevisao: false,
    page: 0,
    ativo: true,
    vazio: undefined,
  });
  const p = new URLSearchParams(s);

  assert.equal(p.get('titulo'), 'erro');
  assert.equal(p.get('page'), '0');
  assert.equal(p.get('ativo'), 'true');
  assert.equal(p.has('numero'), false);
  assert.equal(p.has('status'), false);
  assert.equal(p.has('semPrevisao'), false);
  assert.equal(p.has('vazio'), false);
});

test('qs codifica espaços e acentos', () => {
  assert.equal(qs({ titulo: 'notificação push' }), 'titulo=notifica%C3%A7%C3%A3o+push');
});

test('fmt formata data em pt-BR e devolve vazio para nulo', () => {
  assert.equal(fmt(null), '');
  assert.equal(fmt(''), '');
  assert.match(fmt('2026-01-02T15:04:00Z'), /02\/01\/2026/);
});
