# CLAUDE.md — CodeQuest

## O que é este projeto

CodeQuest é uma aplicação web educacional estilo Duolingo para ensinar lógica de programação com TypeScript a uma criança de 12 anos. Roda **100% no navegador**, sem backend. Conteúdo vem de arquivos `.json` estáticos. O código do aluno é compilado e executado in-browser via Web Worker.

## Stack obrigatória

- **React 18+** com **Vite** (não usar CRA, Next, Remix)
- **TypeScript** em toda a codebase (strict mode)
- **Tailwind CSS** para estilização (não usar CSS modules, styled-components ou Sass)
- **Monaco Editor** (`@monaco-editor/react`) para o editor de código
- **Zustand** para estado global (não usar Redux, MobX, Jotai ou Context API como state manager)
- **React Router v6** para roteamento SPA
- **Framer Motion** para animações
- **Vitest + Testing Library** para testes
- O pacote `typescript` da npm (para compilar TS→JS no browser)

## Estrutura de pastas

```
codequest/
├── public/
│   └── content/                  ← JSONs de lições (JÁ EXISTEM, não recriar)
│       ├── curriculum.json
│       ├── modules/
│       │   ├── 01-variaveis.json
│       │   ├── 02-tipos.json
│       │   ├── 03-condicionais.json
│       │   ├── 04-loops.json
│       │   ├── 05-funcoes.json
│       │   ├── 06-arrays.json
│       │   ├── 07-objetos.json
│       │   └── 08-projeto-final.json
│       └── achievements.json
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── Router.tsx
│   │   └── providers/
│   ├── components/
│   │   ├── layout/               Shell, Sidebar, TopBar
│   │   ├── lesson/               LessonCard, LessonPath, ModuleMap
│   │   ├── exercise/             ExerciseShell, CodeEditor, OutputPanel
│   │   ├── feedback/             SuccessAnimation, ErrorHint, StreakCounter
│   │   └── ui/                   Button, Badge, ProgressBar, Avatar, Modal
│   ├── engine/
│   │   ├── typescript-runner.ts  compila TS e executa em Web Worker
│   │   ├── worker.ts             Web Worker (sandbox isolado)
│   │   ├── test-runner.ts        valida output contra assertions do JSON
│   │   └── hint-engine.ts        analisa erros e gera dicas contextuais
│   ├── content/
│   │   ├── loader.ts             fetch + parse dos JSONs de public/content
│   │   ├── curriculum.types.ts   tipos TS que espelham os schemas JSON
│   │   └── validators.ts         validação de schema (apenas dev mode)
│   ├── store/
│   │   ├── progress.store.ts     progresso do aluno (XP, streak, badges, exercícios)
│   │   ├── settings.store.ts     tema, som, preferências
│   │   └── session.store.ts      sessão atual (lição corrente, timer)
│   ├── hooks/
│   │   ├── useLesson.ts
│   │   ├── useExercise.ts
│   │   ├── useCodeRunner.ts
│   │   └── useProgress.ts
│   ├── pages/
│   │   ├── HomePage.tsx           mapa de módulos (trilha visual)
│   │   ├── LessonPage.tsx         steps paginados de teoria
│   │   ├── ExercisePage.tsx       editor + execução + validação
│   │   ├── ProfilePage.tsx        stats, streak, badges
│   │   └── SettingsPage.tsx
│   ├── styles/
│   │   └── globals.css
│   └── utils/
│       ├── confetti.ts
│       └── sounds.ts
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Conteúdo JSON — schemas e regras

Os JSONs em `public/content/` já estão prontos. **Não modifique-os.** Crie os tipos TypeScript que espelhem esses schemas fielmente.

### Tipos de lição

O campo `type` em cada lição determina o componente renderizado:

- `"theory"` → cards paginados com `steps[]`, cada step é `"explanation"` ou `"interactive-example"`
- `"exercise"` → Monaco Editor com `starterCode`, validação e dicas
- `"challenge"` → igual a exercise, mas com badge de dificuldade e XP maior
- `"quiz"` → questões de múltipla escolha com `questions[]`

### Estratégias de validação

O campo `validation.strategy` define como o código do aluno é avaliado. Todas as 5 estratégias devem ser implementadas:

| Strategy | Lógica |
|---|---|
| `output-match` | Executa o código do aluno + `testCode`. Compara `console.log` output com `expectedOutput` (string exata, trimmed). |
| `variable-check` | Após executar, verifica se variáveis existem com tipo e valor esperado. |
| `function-test` | Executa o código do aluno, depois chama `functionName(input)` e compara retorno com `expectedOutput`. Testar todos os `testCases`. Também checar `additionalTests` se presente. |
| `ast-match` | Usa `ts.createSourceFile()` para gerar a AST e verificar `requiredConstructs` (devem estar presentes) e `forbiddenConstructs` (não podem existir). Depois, rodar os `testCases` normalmente. |
| `custom` | Executa `testCode` que retorna `{ pass: boolean, message: string }`. |

### CommonMistakes

Antes de executar, verificar se o código do aluno contém algum `pattern` do array `commonMistakes[]`. Se sim, exibir a `message` correspondente como feedback amigável em vez do erro de compilação/execução cru.

### Hints

Array ordenado. Revelar uma hint por vez quando o aluno clica "Dica". Cada hint usada reduz as estrelas da lição (3★→2★→1★).

## Engine de execução — regras rígidas

### Fluxo

1. Código do aluno (TypeScript) → `ts.transpileModule()` → JavaScript
2. JavaScript → Web Worker isolado → executa com `new Function()`
3. Captura `console.log` output + erros → devolve ao main thread
4. Test runner compara resultado com `testCases` do JSON

### Web Worker (worker.ts)

O Worker DEVE:
- Interceptar `console.log`, `console.warn`, `console.error` via mock
- Ter timeout de **5 segundos** (matar execução se exceder — anti loop infinito)
- Limitar output a **1000 linhas**
- NÃO ter acesso a `fetch`, `XMLHttpRequest`, `localStorage`, `DOM`, `import`, `eval`, `Function` dentro do escopo do código do aluno
- Retornar `{ success: boolean, output: string, error?: string }`

### TypeScript compiler no browser

- Usar `ts.transpileModule(code, { compilerOptions })` com target ES2020, module ESNext
- Para `ast-match`: usar `ts.createSourceFile()` + `ts.forEachChild()` recursivo para encontrar `SyntaxKind` correspondentes aos constructs (ex: `ts.SyntaxKind.ForStatement`)
- O pacote `typescript` é ~5MB — aplicar lazy loading (só carregar quando entrar numa tela de exercício)

## Gamificação — implementação

### XP e Níveis

- Cada lição/exercício tem `xpReward`. Somar ao total ao completar.
- Thresholds de nível: Lv1=50, Lv2=120, Lv3=220, Lv4=350, Lv5=500, Lv6=700, Lv7=950, Lv8=1250, Lv9=1600, Lv10=2000
- Títulos: "Aprendiz" (1-2), "Explorador" (3-4), "Hacker" (5-6), "Arquiteto" (7-8), "Mestre do Código" (9-10)

### Streak

- Um dia conta como "ativo" se o aluno completou pelo menos 1 lição
- `streak.lastDate` é comparado com a data atual
- Se `lastDate === ontem` → incrementar `current`
- Se `lastDate === hoje` → manter (já contou)
- Se `lastDate < ontem` → resetar `current` para 0
- Atualizar `best` se `current > best`

### Vidas

- 5 vidas por sessão
- Errar um exercício (submeter e falhar no teste) = −1 vida
- 0 vidas = modal "Sem vidas! Espere ou revise exercícios anteriores"
- Regenerar 1 vida a cada 30 minutos
- Toggle em Settings para desativar sistema de vidas

### Estrelas

- 3★ = completou sem dicas
- 2★ = usou 1 dica
- 1★ = usou 2+ dicas
- Salvar no `completedExercises[exerciseId].stars`

### Badges

- Ler `achievements.json` no boot
- Após cada ação (completar exercício, acumular XP, verificar streak), checar todas as condições
- Exibir toast animado ao desbloquear um badge novo

## Persistência

Toda persistência é via `localStorage` sob a chave `codequest-progress`. Estrutura:

```typescript
interface AppProgress {
  profile: {
    name: string;
    avatar: string;
    createdAt: string;
  };
  progress: {
    xp: number;
    level: number;
    streak: { current: number; best: number; lastDate: string };
    lives: { current: number; lastRegen: string };
    completedExercises: Record<string, {
      stars: number;
      attempts: number;
      completedAt: string;
      hintsUsed: number;
    }>;
    unlockedModules: string[];
    achievements: string[];
  };
  settings: {
    soundEnabled: boolean;
    livesEnabled: boolean;
  };
}
```

Um módulo é desbloqueado quando todos os `prerequisites` (definidos em `curriculum.json`) estão em `completedExercises` com pelo menos 1 exercício completo por módulo pré-requisito.

## Design visual — direção obrigatória

### Estética

**Playful-tech.** Dark mode default. Inspiração em jogos indie + UI moderna. NÃO infantilizar — o público é um pré-adolescente de 12 anos, não uma criança de 5. Evitar estéticas genéricas de "app educacional".

### Paleta

```css
:root {
  --bg-primary: #0F0F1A;
  --bg-surface: #1A1A2E;
  --bg-elevated: #252542;
  --color-primary: #00D4AA;      /* verde-neon — sucesso, progresso */
  --color-accent: #FF6B6B;       /* coral — erros, vidas, perigo */
  --color-secondary: #7C5CFC;    /* roxo — XP, badges, recompensas */
  --color-warning: #FFB84D;      /* amarelo — dicas, atenção */
  --color-text: #E8E8F0;
  --color-text-muted: #8888AA;
}
```

### Tipografia

- Headings: **Fredoka** (Google Fonts) — rounded, amigável
- Code/editor: **JetBrains Mono** (Google Fonts)
- Body: **Nunito** (Google Fonts)

Carregar via `@import` no CSS ou `<link>` no HTML.

### Telas e UX

**Home (mapa de módulos):**
- Trilha vertical tipo Duolingo — nós circulares conectados por linhas
- Módulos desbloqueados: coloridos com ícone + barra de progresso
- Módulos trancados: cinza com cadeado
- Sidebar: avatar, nome, nível, barra de XP, streak (🔥), vidas (❤️)

**Lição (teoria):**
- Cards paginados com botões "Anterior" / "Próximo"
- Barra de progresso no topo (step X de Y)
- Blocos de código com syntax highlighting (usar highlight.js ou Prism, somente leitura, NÃO Monaco)
- Markdown rendering no campo `content` (interpretar `**bold**`, `` `code` ``, etc.)

**Exercício (coding):**
- Split layout: instruções à esquerda, editor à direita
- Monaco Editor com tema dark customizado para combinar com a paleta
- Botão "▶ Executar" proeminente em verde
- Painel de output abaixo do editor (estética terminal — fundo `#0A0A15`, fonte mono verde)
- Botão "💡 Dica" (mostra contador: "Dica 1/3")
- Feedback de sucesso: confetti + flash verde + mensagem + XP animation
- Feedback de erro: shake no editor + borda vermelha + mensagem amigável

**Resultado da lição:**
- Animação de celebração
- Estrelas (★★★ / ★★☆ / ★☆☆)
- XP ganho (animação de counter subindo)
- Badges desbloqueados (se houver)
- Botões: "Próxima Lição" / "Voltar ao Mapa"

**Perfil:**
- Avatar (selecionável entre 6-8 opções temáticas)
- Stats: XP total, nível, streak atual, lições completas, estrelas totais
- Grid de badges (desbloqueados brilham, bloqueados em silhueta)

**Settings:**
- Toggle de som
- Toggle de sistema de vidas
- Botão de reset de progresso (com confirmação)

### Responsividade

- Desktop (>1024px): split layout, sidebar sempre visível
- Tablet (768-1024px): sidebar colapsável, editor full-width
- Mobile (<768px): navegação bottom-tab, conteúdo em tela cheia, editor full-screen com toggle entre instruções e código

## Regras de implementação

### Ordem de build (seguir rigorosamente)

**Fase 1 — Fundação:**
Setup Vite + React + TS + Tailwind + Router. Componentes de UI base. Layout shell. Content loader (fetch JSONs + tipos). Store Zustand com persistência.

**Fase 2 — Engine:**
TypeScript compiler in-browser. Web Worker sandbox. Captura de console. Test runner (todas as 5 strategies). Hint engine (commonMistakes matching).

**Fase 3 — Fluxo de lição:**
Mapa de módulos. Tela de teoria com steps paginados. Tela de exercício com Monaco. Fluxo executar → testar → feedback. Sistema de dicas. Tela de resultado.

**Fase 4 — Gamificação:**
XP, níveis, streak, vidas, estrelas, badges, animações de celebração.

**Fase 5 — Polish:**
Animações Framer Motion. Perfil. Settings. Responsividade mobile. Lazy loading do Monaco e TypeScript compiler.

### Ao completar cada fase

Rodar `npm run build` e garantir zero erros. Rodar `npm run dev` e verificar que a feature funciona end-to-end. Só então passar para a próxima fase.

### Versionamento

- **HARD RULE:** Todo commit/push DEVE incrementar a versão em `package.json`
- Usar SemVer: `fix:` → patch (x.y.Z), `feat:` → minor (x.Y.0), breaking change → major (X.0.0)

### Qualidade de código

- Sem `any` — tipar tudo explicitamente
- Componentes pequenos e focados (<150 linhas)
- Hooks customizados para toda lógica reutilizável
- Nomes em inglês para código, português para conteúdo visível ao aluno
- Usar path aliases (`@/components`, `@/engine`, `@/store`, etc.) configurados no `tsconfig.json` e `vite.config.ts`
- Todo componente que recebe props deve ter uma interface de props nomeada `{Nome}Props`
- Não usar `export default` — usar named exports sempre

### O que NÃO fazer

- Não criar backend, API, banco de dados, autenticação ou qualquer infraestrutura server-side
- Não modificar os arquivos JSON em `public/content/` — eles são a fonte de verdade
- Não usar `eval()` no main thread — toda execução de código do aluno é no Web Worker
- Não usar frameworks CSS além do Tailwind (sem Bootstrap, Material UI, Chakra, etc.)
- Não implementar funcionalidades não descritas neste documento
- Não usar localStorage para nada além do progresso do aluno (não cachear JSONs)
- Não fazer fetch para URLs externas em produção (exceto CDN de fontes Google)
- Não exibir erros de compilação TypeScript crus ao aluno — sempre traduzir para linguagem amigável em português

## Testes

- Testar o `test-runner.ts` com cobertura de todas as 5 strategies
- Testar o `progress.store.ts` (XP, streak, vidas, badges)
- Testar o `loader.ts` (parsing dos JSONs, validação de tipos)
- Testar componentes de quiz (seleção, correção, feedback)
- Mínimo 80% de cobertura no `engine/` e `store/`

## Comandos

```bash
npm run dev        # dev server com HMR
npm run build      # build de produção
npm run preview    # preview do build
npm run test       # rodar testes
npm run lint       # linting
```

## Critérios de aceite

A v1.0 está completa quando:

1. O aluno navega pela trilha de 8 módulos e entra em lições
2. Lições de teoria exibem conteúdo paginado com código syntax-highlighted
3. Exercícios abrem o Monaco Editor com starter code preenchido
4. Executar compila TS→JS e roda no Web Worker com output no painel
5. O resultado é validado contra testCases e feedback visual é exibido
6. Dicas revelam progressivamente; commonMistakes mostram mensagens específicas
7. Quizzes funcionam com seleção, correção e explicação
8. XP acumula, nível sobe, streak funciona, badges desbloqueiam
9. Progresso persiste entre sessões (reload não perde dados)
10. Funciona em Chrome, Firefox e Safari modernos
11. Responsivo: desktop, tablet e mobile
12. Zero dependência de rede após o primeiro carregamento (exceto fontes Google)
13. Build de produção sem erros ou warnings
