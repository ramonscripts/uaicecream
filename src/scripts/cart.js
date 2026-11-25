// Carrinho guardado no navegador (localStorage). Formato salvo: { [idDoSabor]: quantidade }.
// Toda mudança dispara o evento 'cart:change' na janela.
import { sabores, PRICE } from '../data/site.js';

const KEY = 'uaice-cart';
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

export function add(id, q = 1) {
  if (!byId(id)) return;
  const cart = read();
  cart[id] = Math.min((cart[id] || 0) + q, MAX);
  write(cart);
}

export function setQty(id, q) {
  const cart = read();
  if (q > 0) cart[id] = Math.min(q, MAX); else delete cart[id];
  write(cart);
}

export function clear() { write({}); }

export function lines() {
  return Object.entries(read()).map(([id, q]) => ({ ...byId(id), q, subtotal: PRICE * q }));
}

export const count = () => lines().reduce((n, l) => n + l.q, 0);
export const total = () => lines().reduce((t, l) => t + l.subtotal, 0);
export { MAX };
