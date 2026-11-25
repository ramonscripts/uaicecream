// Confere o CNPJ pelos dois dígitos verificadores (aceita com ou sem pontuação).
// Desde julho de 2026 a Receita também emite CNPJ com letras nas 12 primeiras posições; os 2 últimos seguem números.
const PESOS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

// mantém só letras e números, em maiúsculas (a máscara do formulário usa a mesma limpeza)
export const limpa = (value) => String(value).toUpperCase().replace(/[^0-9A-Z]/g, '');

// máscara do formulário: 00.000.000/0000-00, com os separadores só até onde já foi digitado
const BLOCOS = [[0, 2, ''], [2, 5, '.'], [5, 8, '.'], [8, 12, '/'], [12, 14, '-']];
export function formata(value) {
  const c = limpa(value).slice(0, 14);
  return BLOCOS.map(([a, b, sep]) => (c.slice(a, b) ? sep + c.slice(a, b) : '')).join('');
}

export function cnpjOk(value) {
  const c = limpa(value);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(c) || /^(.)\1{13}$/.test(c)) return false; // 00.000.000/0000-00 e parecidos passam na conta, mas não existem
  const valor = (ch) => ch.charCodeAt(0) - 48; // regra da Receita: '0'..'9' valem 0..9, 'A' vale 17, 'B' 18...
  const dv = (n) => { // n = quantos caracteres entram na conta (12 ou 13)
    const pesos = PESOS.slice(13 - n);
    let soma = 0;
    for (let i = 0; i < n; i++) soma += valor(c[i]) * pesos[i];
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return dv(12) === valor(c[12]) && dv(13) === valor(c[13]);
}
