# CodeQuest — Plano de Projeto v1.0

## Visão Geral

**CodeQuest** é uma aplicação web educacional estilo Duolingo para ensinar lógica de programação a crianças (público-alvo: 12 anos), usando TypeScript como linguagem. A aplicação roda 100% no navegador, sem backend, com conteúdo alimentado por arquivos `.json` e execução de código in-browser.

---

## 1. Arquitetura Técnica

### 1.1 Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | React 18+ com Vite | Build rápido, HMR, ecossistema maduro |
| Linguagem | TypeScript | Dogfooding — a app ensina o que usa |
| Estilização | Tailwind CSS | Produtividade, design system fácil de manter |
| Editor de código | Monaco Editor (`@monaco-editor/react`) | Mesmo editor do VS Code; syntax highlight, autocomplete e error squiggles para TypeScript nativamente |
| Execução de código | TypeScript compiler API no browser (`typescript` npm package, loaded via CDN/bundled) compilando TS→JS + `eval()` em Web Worker isolado | Zero servidor; sandboxing via Worker |
| Estado global | Zustand | Leve, sem boilerplate, persistência fácil |
| Persistência local | `localStorage` (progresso) + `IndexedDB` (dados maiores, opcional) | Offline-first |
| Roteamento | React Router v6 | SPA navigation |
| Animações | Framer Motion | Feedback visual gamificado |
| Testes | Vitest + Testing Library | Cobertura de componentes e lógica |

### 1.2 Estrutura de Pastas

```
codequest/
├── public/
│   └── content/                    # ← JSON de lições e exercícios
│       ├── curriculum.json         # índice geral do currículo
│       ├── modules/
│       │   ├── 01-variaveis.json
│       │   ├── 02-tipos.json
│       │   ├── 03-condicionais.json
│       │   ├── 04-loops.json
│       │   ├── 05-funcoes.json
│       │   ├── 06-arrays.json
│       │   ├── 07-objetos.json
│       │   └── 08-projeto-final.json
│       └── achievements.json       # badges e conquistas
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── Router.tsx
│   │   └── providers/
│   ├── components/
│   │   ├── layout/                 # Shell, Sidebar, TopBar
│   │   ├── lesson/                 # LessonCard, LessonPath, ModuleMap
│   │   ├── exercise/               # ExerciseShell, CodeEditor, OutputPanel
│   │   ├── feedback/               # SuccessAnimation, ErrorHint, StreakCounter
│   │   └── ui/                     # Button, Badge, ProgressBar, Avatar, Modal
│   ├── engine/
│   │   ├── typescript-runner.ts    # compila TS e executa em Web Worker
│   │   ├── worker.ts              # Web Worker para sandboxing
│   │   ├── test-runner.ts         # valida output contra assertions do JSON
│   │   └── hint-engine.ts         # analisa erros e gera dicas contextuais
│   ├── content/
│   │   ├── loader.ts              # fetch + parse dos JSONs
│   │   ├── curriculum.types.ts    # tipos TS dos schemas de conteúdo
│   │   └── validators.ts          # validação de schema em dev mode
│   ├── store/
│   │   ├── progress.store.ts      # progresso do aluno
│   │   ├── settings.store.ts      # tema, idioma, som
│   │   └── session.store.ts       # sessão atual (lição corrente, timer)
│   ├── hooks/
│   │   ├── useLesson.ts
│   │   ├── useExercise.ts
│   │   ├── useCodeRunner.ts
│   │   └── useProgress.ts
│   ├── pages/
│   │   ├── HomePage.tsx            # mapa de módulos estilo Duolingo
│   │   ├── LessonPage.tsx          # sequência de steps dentro de uma lição
│   │   ├── ExercisePage.tsx        # editor + execução + validação
│   │   ├── ProfilePage.tsx         # stats, streak, badges
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

---

## 2. Schemas JSON — Conteúdo

### 2.1 `curriculum.json` — Índice Geral

```jsonc
{
  "version": "1.0",
  "language": "typescript",
  "modules": [
    {
      "id": "01-variaveis",
      "title": "Variáveis e Constantes",
      "description": "Aprenda a guardar informações na memória do computador",
      "icon": "📦",
      "color": "#4CAF50",
      "file": "modules/01-variaveis.json",
      "prerequisites": [],
      "estimatedMinutes": 30
    }
  ]
}
```

### 2.2 Schema de Módulo (`modules/01-variaveis.json`)

```jsonc
{
  "id": "01-variaveis",
  "title": "Variáveis e Constantes",
  "lessons": [
    {
      "id": "01-01",
      "title": "O que é uma variável?",
      "type": "theory",           // "theory" | "exercise" | "challenge" | "quiz"
      "steps": [
        {
          "type": "explanation",
          "content": "Imagine uma variável como uma **caixa com etiqueta**...",
          "illustration": "box-with-label"   // referencia asset ou animação
        },
        {
          "type": "interactive-example",
          "code": "let nome: string = \"CodeQuest\";\nconsole.log(nome);",
          "highlightLines": [1],
          "explanation": "A palavra `let` cria uma variável. Depois do `:` dizemos o **tipo**."
        }
      ]
    },
    {
      "id": "01-02",
      "title": "Crie sua primeira variável",
      "type": "exercise",
      "difficulty": 1,            // 1-5
      "xpReward": 10,
      "instructions": "Crie uma variável chamada `idade` do tipo `number` com o valor `12`.",
      "starterCode": "// Crie sua variável aqui\n",
      "solution": "let idade: number = 12;",
      "validation": {
        "strategy": "output-match",    // ver seção 2.3
        "testCases": [
          {
            "setupCode": "",
            "testCode": "console.log(typeof idade, idade);",
            "expectedOutput": "number 12"
          }
        ]
      },
      "hints": [
        "Use a palavra `let` para criar uma variável.",
        "Depois do nome, use `:` seguido do tipo `number`.",
        "Atribua o valor com `=`."
      ],
      "commonMistakes": [
        {
          "pattern": "var idade",
          "message": "Quase! Em TypeScript moderno, preferimos `let` em vez de `var`."
        },
        {
          "pattern": "let idade = \"12\"",
          "message": "Cuidado! `\"12\"` entre aspas é texto (string), não um número."
        }
      ]
    }
  ]
}
```

### 2.3 Estratégias de Validação

O campo `validation.strategy` define como o código do aluno será avaliado:

| Strategy | Descrição | Quando usar |
|---|---|---|
| `output-match` | Compara `console.log` output com `expectedOutput` | Exercícios simples de output |
| `variable-check` | Verifica se variáveis existem com tipo/valor esperado | "Crie uma variável chamada X" |
| `function-test` | Chama a função do aluno com inputs e compara outputs | Exercícios de funções |
| `ast-match` | Analisa a AST do código para verificar estruturas usadas | "Use um for loop" (não aceitar while) |
| `custom` | Executa `testCode` arbitrário que retorna `{ pass, message }` | Validações complexas |

Exemplo de `function-test`:

```jsonc
{
  "strategy": "function-test",
  "functionName": "dobrar",
  "testCases": [
    { "input": [2], "expectedOutput": 4 },
    { "input": [0], "expectedOutput": 0 },
    { "input": [-3], "expectedOutput": -6 }
  ]
}
```

Exemplo de `ast-match`:

```jsonc
{
  "strategy": "ast-match",
  "requiredConstructs": ["ForStatement"],
  "forbiddenConstructs": ["WhileStatement"],
  "testCases": [
    { "testCode": "console.log(soma([1,2,3]))", "expectedOutput": "6" }
  ]
}
```

---

## 3. Engine de Execução (TypeScript no Browser)

### 3.1 Fluxo de Execução

```
Código do aluno (TS)
       │
       ▼
┌─────────────────────┐
│  TypeScript Compiler │  ← ts.transpileModule() no main thread
│  (in-browser)        │     ou em Worker dedicado
└─────────┬───────────┘
          │ JS output
          ▼
┌─────────────────────┐
│  Sandbox Web Worker  │  ← executa JS isolado, sem acesso ao DOM
│                      │     timeout de 5s para loops infinitos
│  - captura console   │
│  - captura erros     │
│  - retorna resultado │
└─────────┬───────────┘
          │ { output, errors, variables }
          ▼
┌─────────────────────┐
│  Test Runner         │  ← compara resultado com testCases do JSON
│                      │     retorna { passed, feedback }
└─────────────────────┘
```

### 3.2 Detalhes do Web Worker (`worker.ts`)

```typescript
// Pseudocódigo da estrutura do Worker

self.onmessage = async (event) => {
  const { jsCode, testCode, timeout = 5000 } = event.data;

  // Captura console.log
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: any[]) => logs.push(args.map(String).join(" ")),
    // ... warn, error
  };

  // Execução com timeout
  const timer = setTimeout(() => {
    self.postMessage({
      success: false,
      error: "⏰ Tempo esgotado! Seu código pode ter um loop infinito."
    });
  }, timeout);

  try {
    // Cria escopo isolado
    const fn = new Function("console", jsCode + "\n" + (testCode || ""));
    fn(mockConsole);

    clearTimeout(timer);

    self.postMessage({
      success: true,
      output: logs.join("\n"),
      // Opcionalmente retornar variáveis expostas
    });
  } catch (err) {
    clearTimeout(timer);
    self.postMessage({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
};
```

### 3.3 Segurança do Sandbox

Medidas essenciais já que o público é uma criança:

- Web Worker **sem** acesso a DOM, `fetch`, `XMLHttpRequest`, `localStorage`
- Timeout rígido de **5 segundos** para prevenir loops infinitos
- Limitar output a **1000 linhas** para prevenir memory bombs
- Não expor `eval`, `Function`, `import` dentro do escopo do Worker
- Se AST match for usado, compilar com `ts.createSourceFile` e walk na AST com a API do TypeScript compiler

---

## 4. Sistema de Gamificação

### 4.1 Mecânicas

| Mecânica | Implementação |
|---|---|
| **XP (Pontos de experiência)** | Cada exercício dá XP conforme `xpReward`. XP acumula para níveis. |
| **Níveis** | XP thresholds progressivos (0→Lv1 em 50xp, Lv1→Lv2 em 120xp, etc.). Títulos temáticos: "Aprendiz", "Explorador", "Hacker", "Mestre do Código". |
| **Streak** | Dias consecutivos com pelo menos 1 lição completa. Exibir streak counter com animação de fogo. |
| **Vidas** | 5 vidas por sessão. Errar um exercício perde 1 vida. Vidas regeneram com tempo ou review de erros anteriores. Configurável (pode desativar). |
| **Badges** | Conquistas específicas: "Primeira Variável", "10 Exercícios Sem Erro", "Loop Master", etc. Definidos em `achievements.json`. |
| **Estrelas** | Cada lição dá 1-3 estrelas baseado em acertos sem dica (3★), com 1 dica (2★), com 2+ dicas (1★). |

### 4.2 Schema de Conquistas (`achievements.json`)

```jsonc
{
  "achievements": [
    {
      "id": "first-variable",
      "title": "Primeira Variável",
      "description": "Criou sua primeira variável com sucesso",
      "icon": "📦",
      "condition": {
        "type": "exercise-complete",
        "exerciseId": "01-02"
      }
    },
    {
      "id": "streak-7",
      "title": "Uma Semana de Código!",
      "description": "Manteve um streak de 7 dias",
      "icon": "🔥",
      "condition": {
        "type": "streak",
        "days": 7
      }
    },
    {
      "id": "perfect-module",
      "title": "Perfeição",
      "description": "Completou um módulo inteiro com 3 estrelas",
      "icon": "⭐",
      "condition": {
        "type": "module-perfect",
        "minStars": 3
      }
    }
  ]
}
```

### 4.3 Persistência do Progresso

Estrutura salva em `localStorage`:

```jsonc
{
  "profile": {
    "name": "Jogador",
    "avatar": "robot-1",
    "createdAt": "2026-06-05"
  },
  "progress": {
    "xp": 340,
    "level": 3,
    "streak": { "current": 5, "best": 12, "lastDate": "2026-06-05" },
    "lives": { "current": 4, "lastRegen": "2026-06-05T14:00:00" },
    "completedExercises": {
      "01-02": { "stars": 3, "attempts": 1, "completedAt": "..." },
      "01-03": { "stars": 2, "attempts": 3, "completedAt": "..." }
    },
    "unlockedModules": ["01-variaveis", "02-tipos"],
    "achievements": ["first-variable", "streak-7"]
  }
}
```

---

## 5. Currículo v1.0 — Mapa de Módulos

O currículo segue uma progressão pedagógica cuidadosa, cada módulo construindo sobre o anterior:

### Módulo 1: Variáveis e Constantes (6 lições)
- O que é uma variável? (teoria + exemplo interativo)
- `let` vs `const` — quando usar cada um
- Nomeando variáveis (regras e boas práticas)
- Exercício: crie variáveis para um personagem de jogo
- Exercício: troque valores entre variáveis
- Quiz de revisão

### Módulo 2: Tipos de Dados (7 lições)
- `string` — textos e frases
- `number` — inteiros e decimais
- `boolean` — verdadeiro ou falso
- Template literals e concatenação
- Exercício: ficha de RPG com tipos
- Exercício: calculadora simples
- Quiz de revisão

### Módulo 3: Condicionais (7 lições)
- `if` — tomando decisões
- `else` — o caminho alternativo
- `else if` — múltiplas opções
- Operadores de comparação (`===`, `!==`, `>`, `<`, `>=`, `<=`)
- Operadores lógicos (`&&`, `||`, `!`)
- Exercício: sistema de notas (A/B/C/D/F)
- Desafio: jogo de adivinhação

### Módulo 4: Loops (7 lições)
- `for` — repetindo com contador
- `while` — repetindo com condição
- `break` e `continue`
- Loop dentro de loop (introdução)
- Exercício: tabuada
- Exercício: padrões com asteriscos
- Desafio: FizzBuzz

### Módulo 5: Funções (8 lições)
- O que é uma função? (teoria)
- Parâmetros e argumentos
- Retornando valores (`return`)
- Tipos de parâmetros e retorno
- Arrow functions
- Exercício: funções de matemática (dobrar, somar, média)
- Exercício: validador de senha
- Desafio: mini-calculadora

### Módulo 6: Arrays (7 lições)
- O que é um array?
- Acessando elementos (index)
- Métodos: `push`, `pop`, `length`
- `for...of` para iterar
- `.map()` e `.filter()` (introdução)
- Exercício: lista de tarefas
- Desafio: encontrar o maior número

### Módulo 7: Objetos (6 lições)
- O que é um objeto?
- Propriedades e valores
- Tipos com interfaces (`interface`)
- Arrays de objetos
- Exercício: inventário de RPG
- Desafio: agenda de contatos

### Módulo 8: Projeto Final (3 lições guiadas)
- Planejando o projeto: jogo de texto RPG
- Construindo passo a passo (exercício guiado em etapas)
- Finalizando e celebrando (review + badge especial)

---

## 6. Design e UX

### 6.1 Direção Visual

**Estética:** Playful-tech — colorido mas não infantil demais. Inspiração em jogos indie pixel-art mesclado com UI moderna. Fundo escuro (dark mode default) com acentos vibrantes em neon/gradientes.

**Paleta:**
- Background: `#0F0F1A` (deep space)
- Cards/Surfaces: `#1A1A2E`
- Primary: `#00D4AA` (verde-neon, sucesso/progresso)
- Accent: `#FF6B6B` (coral, erros/vidas)
- Secondary: `#7C5CFC` (roxo, XP/badges)
- Text: `#E8E8F0`

**Tipografia:**
- Headings: `"Fredoka"` (Google Fonts) — rounded, amigável mas não bebê
- Code: `"JetBrains Mono"` — legibilidade excelente para código
- Body: `"Nunito"` — clean, boa legibilidade

### 6.2 Telas Principais

**Tela 1 — Mapa de Módulos (Home)**
- Layout vertical tipo "trilha" do Duolingo
- Cada módulo é um nó circular na trilha com ícone e progresso
- Módulos trancados aparecem em cinza com cadeado
- Sidebar com perfil, streak, XP, e nível
- Animação de partículas ou estrelas no background

**Tela 2 — Lição (Teoria)**
- Painel central com conteúdo em cards paginados (swipe ou botão "Próximo")
- Ilustrações/animações inline explicando conceitos
- Blocos de código com syntax highlighting (somente leitura)
- Barra de progresso da lição no topo

**Tela 3 — Exercício (Coding)**
- Layout split: instruções à esquerda, editor à direita (em mobile, tabs alternando)
- Monaco Editor com tema dark customizado
- Botão "▶ Executar" proeminente
- Painel de output abaixo do editor (console simulado com estética terminal)
- Dicas colapsáveis (revelar uma de cada vez, custo em estrelas)
- Feedback visual: shake + vermelho ao errar, confetti + verde ao acertar

**Tela 4 — Resultado da Lição**
- Animação de celebração (confetti, XP voando para o counter)
- Estrelas conquistadas (1-3)
- Badges desbloqueados (se houver)
- Botão "Próxima Lição" ou "Voltar ao Mapa"

**Tela 5 — Perfil**
- Avatar (selecionável entre opções pixel-art)
- Stats: XP total, nível, streak, lições completas, estrelas totais
- Grid de badges (conquistados brilhantes, não-conquistados em silhueta)
- Gráfico de atividade (calendar heatmap estilo GitHub)

### 6.3 Responsividade

- Desktop (>1024px): layout split no editor, sidebar sempre visível
- Tablet (768-1024px): sidebar colapsável, editor full-width com toggle instruções
- Mobile (<768px): navegação por tabs, editor full-screen quando ativo

---

## 7. Plano de Implementação em Fases

### Fase 1 — Fundação (estimativa: 2-3 dias)
1. Setup do projeto: Vite + React + TS + Tailwind + React Router
2. Estrutura de pastas e configuração de paths
3. Componentes de UI base: Button, Badge, ProgressBar, Modal
4. Layout shell: TopBar + Sidebar + Main area
5. Content loader: fetch e tipagem dos JSONs
6. Store de progresso (Zustand + localStorage)

### Fase 2 — Engine de Execução (estimativa: 2-3 dias)
1. Integrar TypeScript compiler no browser
2. Implementar Web Worker sandbox
3. Captura de console.log e erros
4. Test runner: output-match + variable-check
5. Test runner: function-test
6. Hint engine: matching de commonMistakes

### Fase 3 — Fluxo de Lição (estimativa: 2-3 dias)
1. Tela de Mapa de Módulos com trilha visual
2. Tela de Lição com steps paginados
3. Tela de Exercício: Monaco Editor + painel de output
4. Fluxo de validação: executar → testar → feedback
5. Sistema de dicas progressivas
6. Tela de resultado com animação

### Fase 4 — Gamificação (estimativa: 1-2 dias)
1. Sistema de XP e níveis
2. Streak tracking
3. Sistema de vidas
4. Estrelas por lição
5. Badges e achievements
6. Animações de celebração (confetti, level-up)

### Fase 5 — Conteúdo (estimativa: 3-5 dias)
1. Escrever JSON de cada módulo (1-8)
2. Criar todos os exercícios com testCases validados
3. Escrever hints e commonMistakes
4. Definir achievements.json
5. Testar cada exercício end-to-end

### Fase 6 — Polish (estimativa: 2-3 dias)
1. Animações e transições
2. Sons de feedback (opcional, toggle em settings)
3. Tela de Settings (tema, som, reset progresso)
4. Tela de Perfil com stats
5. Responsividade mobile
6. Testes automatizados
7. Performance review e lazy loading dos módulos

---

## 8. Considerações Técnicas Importantes

### 8.1 TypeScript no Browser

O pacote `typescript` da npm (~5MB) pode ser bundled ou carregado via CDN. Usar `ts.transpileModule()` que é síncrono e leve — não precisa de program/checker completo para transpilação. Para AST analysis (ast-match strategy), usar `ts.createSourceFile()` + walk.

### 8.2 Monaco Editor

O Monaco Editor é pesado (~2MB). Estratégias de otimização:
- Lazy load: só carregar quando o usuário entra em um exercício
- Usar `@monaco-editor/react` que gerencia loading automaticamente
- Configurar apenas o language worker de TypeScript (não carregar JSON, HTML, CSS workers)
- Definir tema customizado que combine com a paleta da app

### 8.3 Offline / PWA (futuro)

A estrutura permite facilmente adicionar um Service Worker para funcionar como PWA:
- JSONs de conteúdo em cache
- TypeScript compiler em cache
- Funciona 100% offline após primeiro load

---

## 9. Extensibilidade Futura

Decisões de design que facilitam evoluções futuras:

- **Novo idioma de programação:** trocar o compiler e os JSONs; a engine de test é agnóstica ao output
- **Editor de conteúdo:** um CRUD simples para gerar JSONs pode ser criado como ferramenta separada
- **Multiplayer/ranking:** os JSONs de progresso podem ser sincronizados via Firebase ou Supabase futuramente
- **I18n:** textos nos JSONs podem ter chaves de tradução; UI strings em arquivo de i18n separado
- **AI Tutor:** integrar API de LLM para explicações personalizadas de erros (requer servidor)

---

## 10. Critérios de Aceite da v1.0

A aplicação está pronta para v1.0 quando:

- [ ] Todos os 8 módulos têm pelo menos suas lições e exercícios definidos em JSON
- [ ] O aluno consegue navegar pela trilha de módulos e entrar em lições
- [ ] Lições de teoria exibem conteúdo paginado com exemplos de código
- [ ] Exercícios abrem o Monaco Editor com starter code
- [ ] O botão "Executar" compila TS→JS e roda em Web Worker
- [ ] O resultado é validado contra testCases e feedback é exibido
- [ ] Dicas são reveladas progressivamente
- [ ] CommonMistakes são detectados e mostram mensagens específicas
- [ ] XP é acumulado e nível atualizado
- [ ] Streak é rastreado por dia
- [ ] Badges são desbloqueados quando condições são atingidas
- [ ] Progresso persiste em localStorage entre sessões
- [ ] App funciona em Chrome, Firefox e Safari modernos
- [ ] App é responsiva (desktop + tablet + mobile)
- [ ] Nenhuma dependência de servidor ou rede após o primeiro carregamento
