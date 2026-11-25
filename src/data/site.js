// Lógica dos dados. O conteúdo editável fica nos .json desta pasta:
//   sabores.json  sabores (id, name, image, tags, desc, about)
//   equipe.json   integrantes (name, role, ra, image)
//   loja.json     preço, cidades atendidas e ficha de cada picolé
// Aqui ficam só o que precisa de código: formatar preço e montar menu e rodapé.
import sabores from './sabores.json';
import equipe from './equipe.json';
import loja from './loja.json';

export { sabores, equipe };
export const PRICE = loja.preco;
export const cidades = loja.cidades;
export const ficha = loja.ficha.map((f) => [f.titulo, f.texto]); // formato que o componente Cols usa
export const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Menu em tela cheia (celular e computador). icon: nome em src/components/Icon.astro.
// Grupos (com items) abrem a lista de subitens logo abaixo; os demais são links diretos.
export const menu = [
  { label: 'página inicial', icon: 'inicio', items: [['/', 'voltar ao início'], ['/#uaice-fit', 'a uaice fit'], ['/#sabores', 'sabores'], ['/#onde-comprar', 'onde comprar']] },
  { label: 'produtos', icon: 'sabores', items: sabores.map((s) => [`/sabores/${s.id}`, s.name]) },
  { label: 'loja', icon: 'loja', href: '/comprar' },
  { label: 'planejamento', icon: 'planejamento', href: '/planejamento' },
  { label: 'carrinho', icon: 'carrinho', href: '/carrinho' },
];

export const footer = [
  { title: 'loja', links: [['/#uaice-fit', 'uaice fit'], ['/#sabores', 'sabores'], ['/comprar', 'loja'], ['/carrinho', 'carrinho']] },
  { title: 'o trabalho', links: [['/planejamento', 'planejamento'], ['/planejamento#metas', 'metas'], ['/planejamento#equipe', 'equipe']] },
];
