# CodeQuest — Melhorias Identificadas

> Auditoria realizada em 2026-06-05. Build e testes passando (72 testes, 0 falhas).
>
> Itens marcados com ~~riscado~~ foram resolvidos ou descartados.

---

## P0 — Bugs Críticos

### ~~1. Texto do botão primário invisível~~ (DESCARTADO)

- **Arquivo:** `src/components/ui/Button.tsx:16`
- **Status:** Falso positivo. A classe `text-bg-primary` aplica `#0F0F1A` (escuro) sobre `bg-primary` (`#00D4AA`, verde-neon). O contraste calculado é **9.97:1** (WCAG AAA). Texto branco teria apenas 1.91:1 — a escolha atual é a correta.

### ~~2. Sandbox do Worker incompleta~~ (RESOLVIDO)

- **Arquivo:** `src/engine/worker.ts`
- **Status:** Corrigido. Melhorias aplicadas:
  - `"use strict"` injetado no código executado (bloqueia `arguments.callee`)
  - Código do aluno encapsulado em IIFE com `.call(Object.create(null))` (sem `this` global)
  - `eval`, `Function` e `globalThis` bloqueados via parameter shadowing na IIFE
  - Protótipos críticos congelados antes da execução (`Object`, `Array`, `Function`, `String`, `Number`, `Boolean`, `RegExp`, `Date`, `Error`, `Promise`, `Map`, `Set`, `JSON`, `Math`)
  - Lista ampliada de globais bloqueados: `navigator`, `location`, `origin`, `caches`, `EventSource`, `ServiceWorker`, `Notification`

---

## P1 — Bugs Importantes

### ~~3. Race condition no check de achievements~~ (RESOLVIDO)

- **Arquivo:** `src/pages/ExercisePage.tsx`
- **Status:** Corrigido. Substituído `setTimeout(() => checkAndUnlock(), 50)` por um `useEffect` reativo que dispara o check quando `completedExercises` muda no store, usando um ref `pendingAchievementCheck` como gate para evitar checks desnecessários.

### ~~4. Falha silenciosa no carregamento de módulos~~ (RESOLVIDO)

- **Arquivo:** `src/pages/HomePage.tsx`
- **Status:** Corrigido. Módulos que falham no carregamento são rastreados em estado `failedModules`. Um banner de aviso é exibido no topo do mapa listando os nomes dos módulos que não puderam ser carregados.

### ~~5. Validação de schema só em dev mode~~ (RESOLVIDO)

- **Arquivo:** `src/content/loader.ts`
- **Status:** Corrigido. Validação agora roda em todos os ambientes. Se o schema for inválido, um `Error` é lançado com mensagem descritiva, que será capturado pelo error handling do componente que fez o fetch.

### ~~6. Faltam testes para o test-runner (core da engine)~~ (RESOLVIDO)

- **Arquivo:** `tests/engine/test-runner.test.ts`
- **Status:** Corrigido. Criado arquivo com 28 testes cobrindo todas as 5 strategies:
  - `output-match` — 8 testes (match, mismatch, whitespace trim, runtime error, múltiplos cases, numérico, booleano, falha parcial)
  - `variable-check` — 3 testes (match, mismatch, runtime error)
  - `function-test` — 5 testes (sucesso, falha, additionalTests, functionName ausente, runtime error)
  - `ast-match` — 4 testes (AST válida + output ok, construct ausente, construct proibido, AST ok + output errado)
  - `custom` — 5 testes (pass, fail, transpile error, JSON malformado, sem testCode)
  - Edge cases — 3 testes (strategy desconhecida, testCases vazio, testCases undefined)

### ~~7. Hints e stars com lógica inconsistente em retries~~ (RESOLVIDO)

- **Arquivo:** `src/store/progress.store.ts`
- **Status:** Corrigido. Removido `Math.min` no `hintsUsed` salvo. Agora `hintsUsed` reflete a tentativa mais recente, enquanto `stars` mantém `Math.max` (melhor resultado). Retries podem melhorar a pontuação — o aluno é incentivado a refazer exercícios sem usar dicas.

---

## P2 — Melhorias de UX e Acessibilidade

### ~~8. Acessibilidade: botões sem aria-label~~ (RESOLVIDO)

- **Status:** Corrigido. Adicionado `aria-label` em:
  - `TopBar.tsx` — botão menu/voltar com `aria-label="Menu"` / `aria-label="Voltar"`
  - `Modal.tsx` — botão fechar com `aria-label="Fechar"` e `aria-hidden` no ícone
  - `ExercisePage.tsx` — botão voltar às instruções com `aria-label="Voltar às instruções"`

### ~~9. Acessibilidade: Avatar não responde à tecla Space~~ (RESOLVIDO)

- **Arquivo:** `src/components/ui/Avatar.tsx`
- **Status:** Corrigido. Adicionado `e.key === ' '` ao handler de teclado com `e.preventDefault()` para evitar scroll.

### ~~10. Acessibilidade: sem focus ring nos botões~~ (RESOLVIDO)

- **Arquivo:** `src/components/ui/Button.tsx`
- **Status:** Corrigido. Adicionado `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary`.

### ~~11. Modal de avatar não responsivo em telas pequenas~~ (RESOLVIDO)

- **Arquivo:** `src/pages/ProfilePage.tsx`
- **Status:** Corrigido. Grid alterado de `grid-cols-4 gap-3` para `grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3`.

---

## ~~P2 — Melhorias de Código~~ (TODOS RESOLVIDOS)

### ~~12. ExercisePage excede limite de tamanho~~ (RESOLVIDO)

- **Status:** Corrigido. Extraídos 4 arquivos:
  - `src/components/exercise/HintPanel.tsx` (55 linhas)
  - `src/components/exercise/OutputPanel.tsx` (44 linhas)
  - `src/components/exercise/SuccessOverlay.tsx` (76 linhas)
  - `src/engine/monaco-theme.ts` (26 linhas)
  - `ExercisePage.tsx` reduzido de 478 para 285 linhas

### ~~13. Non-null assertion sem bounds check~~ (RESOLVIDO)

- **Arquivo:** `src/pages/QuizPage.tsx`
- **Status:** Corrigido. Adicionado guard `if (!currentQuestion) return` em `handleAnswer`. Render path usa fallback `?? quiz.questions[0]!`. Também corrigido `setTimeout → useEffect` para achievements (mesmo padrão do P1 #3).

### ~~14. Keys com índice de array no RichText~~ (RESOLVIDO)

- **Arquivo:** `src/components/ui/RichText.tsx`
- **Status:** Corrigido. Key alterada de `key={i}` para `` key={`${i}-${line.slice(0, 20)}`} ``.

### ~~15. localStorage keys hardcoded~~ (RESOLVIDO)

- **Status:** Corrigido. Criado `src/store/constants.ts` com `STORAGE_KEYS` e atualizado `progress.store.ts` e `settings.store.ts` para usar as constantes.

### ~~16. Formatação manual de datas no streak~~ (RESOLVIDO)

- **Arquivo:** `src/store/progress.store.ts`
- **Status:** Corrigido. Extraída função `toLocalDateString(date: Date): string` que encapsula a formatação YYYY-MM-DD, usada no `updateStreak`.

---

## Resumo

| Prioridade | # | Descrição | Esforço estimado |
|---|---|---|---|
| ~~P0~~ | ~~1~~ | ~~Fix cor do botão primário~~ | ~~descartado — falso positivo~~ |
| ~~P0~~ | ~~2~~ | ~~Hardening do sandbox do Worker~~ | ~~resolvido~~ |
| ~~P1~~ | ~~3~~ | ~~Fix race condition achievements~~ | ~~resolvido~~ |
| ~~P1~~ | ~~4~~ | ~~Error handling no carregamento de módulos~~ | ~~resolvido~~ |
| ~~P1~~ | ~~5~~ | ~~Validação de schema em produção~~ | ~~resolvido~~ |
| ~~P1~~ | ~~6~~ | ~~Testes do test-runner (5 strategies)~~ | ~~resolvido~~ |
| ~~P1~~ | ~~7~~ | ~~Clarificar lógica de hints/stars em retries~~ | ~~resolvido~~ |
| ~~P2~~ | ~~8-11~~ | ~~Melhorias de acessibilidade~~ | ~~resolvido~~ |
| ~~P2~~ | ~~12~~ | ~~Extrair sub-componentes do ExercisePage~~ | ~~resolvido~~ |
| ~~P2~~ | ~~13~~ | ~~Bounds check no QuizPage~~ | ~~resolvido~~ |
| ~~P2~~ | ~~14~~ | ~~Fix keys no RichText~~ | ~~resolvido~~ |
| ~~P2~~ | ~~15~~ | ~~Centralizar localStorage keys~~ | ~~resolvido~~ |
| ~~P2~~ | ~~16~~ | ~~Refatorar formatação de datas~~ | ~~resolvido~~ |

**Todos os 16 itens foram resolvidos ou descartados.**
