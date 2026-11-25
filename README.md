# uaice cream

Site de apresentação do **trabalho de marketing** da Universidade de Uberaba (2026), feito pela Consultoria Raiz: planejamento de marketing para o lançamento da **uaice fit**, linha de picolés fit recheados da uaice cream, marca fictícia.

Feito com [Astro](https://astro.build): o build gera HTML estático, sem JavaScript de framework no navegador.

## Como rodar

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
```

```sh
npm test         # testa a conferência do CNPJ
```

A Vercel usa o `vercel.json`: Astro (que já roda `npm run build` e publica `dist/`) e instalação com `npm ci`.

## Onde mexer

| Quero mudar... | Arquivo |
| --- | --- |
| Sabores (nome, textos, foto, tags) | `src/data/sabores.json` |
| Equipe (nome, cargo, RA, foto) | `src/data/equipe.json` |
| Preço, cidades atendidas e valores de cada picolé | `src/data/loja.json` |
| Menu, rodapé e formatação de preço | `src/data/site.js` |
| Página inicial (`/`) | `src/pages/index.astro` |
| Detalhes de um sabor (`/sabores/<sabor>`) | `src/pages/sabores/[id].astro` |
| Loja (`/comprar`) | `src/pages/comprar/index.astro` |
| Compra de um sabor (`/comprar/<sabor>`) | `src/pages/comprar/[id].astro` |
| Carrinho (`/carrinho`) | `src/pages/carrinho.astro` |
| Compra simulada, sem conta (`/checkout`) | `src/pages/checkout.astro` |
| Regras do carrinho (salvo no navegador) | `src/scripts/cart.js` |
| Trabalho de marketing (`/planejamento`) | `src/pages/planejamento.astro` |
| Estrutura comum (head, Header, Footer) | `src/layouts/Base.astro` |
| Componentes (Feature, Hero, ProfileCard, Button, Tag...) | `src/components/` |

Cada sabor novo em `sabores.json` ganha sozinho a página de detalhes, a de compra e o item no menu.

Campos de `sabores.json`: `id` vira o endereço (`/sabores/<id>`) e o nome das fotos, `desc` é a frase curta dos cards e `about` é o texto da página de detalhes. Os arquivos `.json` não aceitam comentários nem vírgula depois do último item: se algo estiver errado, o `npm run build` acusa o arquivo e a linha.

Cada sabor precisa de três fotos, com o `id` no nome: `public/img/sabores/<id>.jpg`, `public/img/sabores/<id>-home.jpg` (de perto, mostrando o recheio) e `public/img/embalagens/embalagem-<id>.jpg`. Sem elas, as páginas mostram imagem quebrada. Reduza as fotos antes de pôr no site (cerca de 1600 px de largura, até uns 200 KB cada).

Os números do picolé (peso, proteína, fibras, calorias) ficam em `ficha`, no `loja.json`, e aparecem nos cards da home, do planejamento e das páginas de sabor. Mantenha a ordem (peso, proteína, fibras, calorias): a home lê os números pela posição.

## Design system

O visual segue o design system da uaice cream. As páginas carregam só o `public/styles.css`, que importa:

- `public/ds/tokens.css`: fontes locais (`public/ds/fonts/`) e variáveis de cor, fonte, espaço e raio, geradas a partir de `public/ds/tokens.json`.
- `public/ds/bundle.css`: os estilos dos componentes do design system, copiados sem alteração.

Não use cores, fontes ou bordas fora dessas variáveis. O site tem um só visual: fundo claro, com faixas escuras só onde a página pede (como a capa da home). O `public/site.js` troca a cor do cabeçalho fixo conforme a faixa embaixo dele.

Foto da capa da home: coloque o arquivo em `public/img/` e escreva o caminho na constante `capa` de `src/pages/index.astro`. A foto aparece desfocada por trás do texto.

## Grupo

| Integrante | Cargo | RA |
| --- | --- | --- |
| Gabriel Gonçalves Mascarenhas | CEO · diretor executivo | 5167587 |
| Yuri Gustavo Cruz Alves da Silva | COO · diretor de operações e qualidade | 5167014 |
| Ezequias Moura Cardoso | CCO · diretor de criação | 5166309 |
| Ramon Carvalho Querino | CDO · diretor de design | 5165275 |
