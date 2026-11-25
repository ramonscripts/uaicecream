// Pedido do lojista guardado no navegador (localStorage). Formato salvo: { [idDoSabor]: caixas }.
// Toda mudança dispara o evento 'cart:change' na janela.
import { sabores, PRICE_CAIXA, CAIXA, MINIMO } from '../data/site.js';

const KEY = 'uaice-pedido'; // chave nova: o carrinho antigo guardava unidades, não caixas
const MAX = 99;

export const byId = (id) => sabores.find((s) => s.id === id);

export function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const out = {};
    // descarta ids desconhecidos e quantidades inválidas que possam estar salvas
    for (const [id, q] of Object.entries(raw && typeof raw === 'object' ? raw : {})) {
      if (byId(id) && Number.isInteger(q) && q > 0) out[id] = Math.min(q, MAX);
    }
    return out;
  } catch (e) {
    return {};
  }
}

function write(cart) {
  try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* modo privado: o carrinho vale só nesta página */ }
  window.dispatchEvent(new CustomEvent('cart:change'));
}

// devolve quantas caixas entraram de fato (pode ser menos que q por causa do teto MAX)
export function add(id, q = 1) {
  if (!byId(id)) return 0;
  const cart = read();
  const antes = cart[id] || 0;
  cart[id] = Math.min(antes + q, MAX);
  write(cart);
  return cart[id] - antes;
}

export function setQty(id, q) {
  const cart = read();
  if (q > 0) cart[id] = Math.min(q, MAX); else delete cart[id];
  write(cart);
}

export function clear() { write({}); }

export function lines() {
  return Object.entries(read()).map(([id, q]) => ({ ...byId(id), q, units: q * CAIXA, subtotal: PRICE_CAIXA * q }));
}

export const count = () => lines().reduce((n, l) => n + l.q, 0); // caixas
export const units = () => count() * CAIXA;
export const missing = () => Math.max(0, MINIMO - count()); // caixas que faltam para o pedido mínimo
export const total = () => lines().reduce((t, l) => t + l.subtotal, 0);
export { MAX };
