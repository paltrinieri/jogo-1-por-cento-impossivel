# 1% Impossível — v2 (React + Canvas)

Reescrita visual completa do jogo: a **mecânica é exatamente a mesma** da
versão anterior (física do pulo, 6 fases/mapas, lobo caçador, buracos,
obstáculos aéreos, itens colecionáveis, bichos desbloqueáveis) — o que mudou
foi **como tudo é desenhado**.

## O que mudou

| Antes | Agora |
|---|---|
| Um arquivo HTML único | Projeto Vite + React + TypeScript organizado em módulos |
| `<div>`s posicionadas por CSS | Canvas HTML5, desenhado a 60fps via `requestAnimationFrame` |
| Lógica de jogo misturada com DOM | Motor de jogo (`GameEngine`) isolado, sem nenhuma dependência de React |
| CSS puro para telas | Componentes React com cards, sombras e botões grandes pra toque |

## Arquitetura

```
src/
├── engine/                  # NADA aqui depende de React — só TypeScript puro
│   ├── GameEngine.ts         # física, spawn, colisão, pontuação, fases, lobo, itens
│   ├── render.ts              # todas as funções de desenho no Canvas
│   ├── constants.ts           # física, dificuldade, lobo, itens (tuning do jogo)
│   ├── themes.ts               # os 6 mapas (obstáculos + decoração + aéreo)
│   ├── animals.ts               # bichos, frases de taunt/derrota
│   ├── particles.ts              # sistema de partículas (poeira, impacto, pontos)
│   ├── audio.ts                   # efeitos sonoros sintetizados (Web Audio API)
│   └── storage.ts                  # leitura/escrita no localStorage
│
├── components/               # só apresentação (React)
│   ├── GameCanvas.tsx          # hospeda o <canvas> e captura o toque
│   ├── HUD.tsx                  # pontos, fase, tentativas, pause, som, item
│   ├── StartScreen.tsx           # título, seletor de bicho/cor, jogar
│   ├── PauseScreen.tsx            # continuar / reiniciar / menu
│   ├── GameOverScreen.tsx          # carimbo, frase, estatísticas, retry
│   └── ShareButton.tsx              # compartilhar resultado
│
├── hooks/
│   └── useGameEngine.ts        # cria o motor, roda o game loop no Canvas,
│                                  republica eventos como estado React
│
├── types/index.ts             # tipos compartilhados (Obstacle, Theme, Animal...)
├── App.tsx                    # orquestra Canvas + telas conforme o status do jogo
└── styles/global.css          # CSS das telas (cards, botões, HUD) — o Canvas
                                  não usa nada daqui, é desenhado via código
```

### Por que Canvas + React (e não tudo em Canvas, ou tudo em DOM)

- **Canvas** é ótimo pra coisa que se move 60x por segundo (personagem,
  obstáculos, partículas, parallax) — dá controle real de camadas, sombra e
  desenho que CSS/DOM não têm.
- **React** é ótimo pra coisa que aparece/desaparece por evento (menus, HUD,
  telas de resultado) — mais fácil de manter, testar e estilizar.
- O `GameEngine` não sabe que React existe. Ele expõe estado (`score`,
  `level`, `player`, `obstacles`...) e métodos (`start()`, `jump()`,
  `useItem()`...). O hook `useGameEngine` é a única ponte: ele roda o loop do
  Canvas e só *republica* como estado React os eventos que a interface
  precisa saber (mudou a pontuação, mudou de fase, morreu) — evitando
  re-renderizar a árvore React 60 vezes por segundo.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal. Pra testar no celular, use o
endereço de rede que o Vite também imprime, com o celular na mesma Wi-Fi.

### Build de produção

```bash
npm run build
npm run preview
```

## Publicar na Vercel

1. Suba o projeto pro GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe o repo.
3. Build Command: `npm run build` — Output Directory: `dist`.
4. Deploy.

## Transformar em APK instalável

Este projeto já vem com manifesto PWA e service worker prontos
(`public/manifest.json`, `public/service-worker.js`, ícones). Depois de
publicado numa URL pública (passo acima):

1. Acesse [pwabuilder.com](https://www.pwabuilder.com).
2. Cole a URL do site publicado.
3. Escolha **Android → Download Package** para gerar o `.apk`/`.aab`.
4. Baixe o APK no celular, abra o arquivo e autorize a instalação de fonte
   desconhecida quando o Android pedir.

## Nota sobre Tailwind

O pedido original mencionava CSS/Tailwind pras telas fora do Canvas. Optei
por **CSS puro bem organizado** (`src/styles/global.css`, com tokens de cor/
tipografia no `:root`) em vez de configurar um pipeline Tailwind/PostCSS,
porque não tive como validar a instalação das dependências nesse ambiente.
Se quiser migrar pra Tailwind depois, os nomes de classe já são
descritivos (`.primary-btn`, `.card`, `.stat-row`...) — é uma troca
mecânica, arquivo por arquivo.

## Validação

Este ambiente não tem acesso à internet, então não rodei `npm install` de
verdade. Para compensar, usei um TypeScript instalado localmente para:

- Compilar `src/engine/*` e `src/types/*` em modo `strict` — **sem nenhum
  erro de tipo**.
- Validar a sintaxe de todos os 18 arquivos `.ts`/`.tsx` do projeto (parser
  real do TypeScript) — **sem nenhum erro**.

Ainda assim, vale rodar `npm run build` localmente antes de publicar, pra
pegar qualquer detalhe de tipagem do React que só aparece com `@types/react`
instalado de verdade.
