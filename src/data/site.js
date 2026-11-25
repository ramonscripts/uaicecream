// Lógica dos dados. O conteúdo editável fica nos .json desta pasta:
//   sabores.json  sabores (id, name, tags, desc, about); as fotos seguem o id (veja o README)
//   equipe.json   integrantes (name, role, ra, image)
//   loja.json     preços (lojista e sugerido), caixa e pedido mínimo, cidades, ficha e pontos de venda
// Aqui ficam só o que precisa de código: formatar preço e montar menu e rodapé.
import sabores from './sabores.json';
import equipe from './equipe.json';
import loja from './loja.json';

export { sabores, equipe };
// venda para lojistas: preço por unidade, em caixas fechadas, com pedido mínimo em caixas
export const PRICE = loja.precoLojista;
export const SUGERIDO = loja.precoSugerido; // preço sugerido para a loja revender
export const CAIXA = loja.caixa; // unidades por caixa
export const PRICE_CAIXA = Math.round(PRICE * CAIXA * 100) / 100;
export const MINIMO = loja.pedidoMinimo; // caixas
export const tiposDeLoja = loja.tiposDeLoja;
export const cidades = loja.cidades;
export const pontos = loja.pontos; // onde encontrar: cidade > lugares
export const emBreve = loja.emBreve; // cidades que ainda vão receber a uaice fit
export const ficha = loja.ficha.map((f) => [f.titulo, f.texto]); // formato que o componente Cols usa
export const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Menu em tela cheia (celular e computador). icon: nome em src/components/Icon.astro.
// Grupos (com items) abrem a lista de subitens logo abaixo; os demais são links diretos.
export const menu = [
  { label: 'página inicial', icon: 'inicio', items: [['/', 'voltar ao início'], ['/#uaice-fit', 'a uaice fit'], ['/#sabores', 'sabores'], ['/#onde-comprar', 'onde comprar']] },
  { label: 'produtos', icon: 'sabores', items: sabores.map((s) => [`/sabores/${s.id}`, s.name]) },
  { label: 'loja para lojistas', icon: 'loja', href: '/comprar' },
  { label: 'planejamento', icon: 'planejamento', href: '/planejamento' },
  { label: 'pedido', icon: 'carrinho', href: '/carrinho' },
];

export const footer = [
  { title: 'loja', links: [['/#uaice-fit', 'uaice fit'], ['/#sabores', 'sabores'], ['/comprar', 'loja para lojistas'], ['/carrinho', 'pedido']] },
  { title: 'o trabalho', links: [['/planejamento', 'planejamento'], ['/planejamento#metas', 'metas'], ['/planejamento#equipe', 'equipe']] },
];
