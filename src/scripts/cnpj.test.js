// npm test. Confere a conta dos dígitos verificadores do CNPJ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cnpjOk, formata } from './cnpj.js';

test('máscara põe os separadores conforme digita e não muda o que já está formatado', () => {
  assert.equal(formata(''), '');
  assert.equal(formata('12'), '12');
  assert.equal(formata('123'), '12.3');
  assert.equal(formata('123456789'), '12.345.678/9');
  assert.equal(formata('1234567890123'), '12.345.678/9012-3');
  assert.equal(formata('12abc34501de35'), '12.ABC.345/01DE-35');
  assert.equal(formata('12.ABC.345/01DE-3599'), '12.ABC.345/01DE-35'); // corta no 14º caractere
  assert.equal(formata(formata('11222333000181')), '11.222.333/0001-81');
});

test('aceita CNPJ válido, com ou sem pontuação', () => {
  assert.equal(cnpjOk('11.222.333/0001-81'), true);
  assert.equal(cnpjOk('11222333000181'), true);
});

test('aceita CNPJ com letras (exemplo do manual da Receita), também em minúsculas', () => {
  assert.equal(cnpjOk('12.ABC.345/01DE-35'), true);
  assert.equal(cnpjOk('12abc34501de35'), true);
});

test('recusa dígito verificador errado', () => {
  assert.equal(cnpjOk('11.222.333/0001-82'), false);
  assert.equal(cnpjOk('11.222.333/0002-81'), false); // mudou um número do meio
  assert.equal(cnpjOk('12.ABC.345/01DF-35'), false); // mudou uma letra
});

test('recusa tamanho errado, letra no dígito verificador e números todos iguais', () => {
  assert.equal(cnpjOk(''), false);
  assert.equal(cnpjOk('11.222.333/0001-8'), false);
  assert.equal(cnpjOk('11.222.333/0001-8A'), false);
  assert.equal(cnpjOk('00.000.000/0000-00'), false);
  assert.equal(cnpjOk('11.111.111/1111-11'), false);
});
