# Plano de Implementação — Melhorias UX/UI (Relatório de Análise)

Baseado no relatório de análise UX/UI, organizado por prioridade e impacto.

---

## Fase 1 — Alto Impacto / Quick Wins

### 1.1 Barra de Símbolos no Editor Mobile
**Problema:** Digitar `{ } [ ] ( ) ; = " > < /` no teclado mobile é difícil.
**Solução:** Criar componente `SymbolToolbar` que aparece acima do editor Monaco no mobile (<768px). Botões para os símbolos mais usados em código.
**Arquivo:** `src/components/exercise/SymbolToolbar.tsx`
**Integra em:** `ExercisePage.tsx` (condicional mobile)

### 1.2 Feedback Visual ao Executar (Console Vazio)
**Problema:** Ao clicar "Executar", se o console está vazio não há feedback claro.
**Solução:** Adicionar animação de entrada no `OutputPanel` quando recebe output — scroll suave + highlight momentâneo do painel. Se sucesso sem output, mostrar "✓ Código executado com sucesso".
**Arquivo:** `src/components/exercise/OutputPanel.tsx`

### 1.3 Confirmação Reforçada no Reset
**Problema:** Botão "Resetar Progresso" é perigoso, modal atual pode não ser suficiente.
**Solução:** Exigir que o usuário digite "APAGAR" para confirmar. Mostrar o que será perdido (X estrelas, Y XP, Z troféus).
**Arquivo:** `src/pages/SettingsPage.tsx`

### 1.4 Aviso de Persistência Local
**Problema:** Usuário pode perder progresso ao limpar cache sem saber.
**Solução:** Adicionar aviso na página "Sobre" e no Perfil: "Seu progresso é salvo neste navegador. Se limpar os dados ou trocar de aparelho, o progresso será perdido."
**Arquivo:** `src/pages/AboutPage.tsx`, `src/pages/ProfilePage.tsx`

---

## Fase 2 — Gamificação e Engajamento

### 2.1 Modal de Sucesso Motivacional
**Problema:** Feedback de acerto é funcional mas não "libera dopamina".
**Solução:** No `SuccessOverlay`, adicionar frases motivacionais aleatórias ("Mandou bem!", "Gênio!", "Código perfeito!") e animação de XP subindo com counter animado (já existe parcialmente).
**Arquivo:** `src/components/exercise/SuccessOverlay.tsx`

### 2.2 Troféus com Mais Vida Visual
**Problema:** Tela de troféus/badges está "fria" — bloqueados e desbloqueados muito parecidos.
**Solução:** Badges bloqueados em cinza escuro com silhueta. Desbloqueados com brilho/glow por raridade (já parcialmente implementado). Adicionar títulos temáticos nos achievements.
**Arquivo:** `src/pages/ProfilePage.tsx` (componente `BadgeCard`)

### 2.3 Destaque da Próxima Lição no Mapa
**Problema:** Usuário pode se perder na trilha — qual lição fazer agora?
**Solução:** Adicionar `animate-pulse-glow` ao nó da próxima lição. Escala levemente maior (scale 1.05) no item marcado como `isNext`.
**Arquivo:** `src/pages/HomePage.tsx` (componente `LessonItem`)

---

## Fase 3 — Experiência do Editor

### 3.1 Sublinhado de Erro no Editor
**Problema:** Erros mostram mensagem traduzida, mas o aluno não sabe em qual linha olhar.
**Solução:** Usar markers do Monaco para sublinhar a linha com erro (squiggly vermelha). Extrair número da linha do erro de compilação e chamar `editor.deltaDecorations()`.
**Arquivo:** `src/pages/ExercisePage.tsx` (integração com ref do Monaco)

### 3.2 Auto-save do Código no Editor
**Problema:** Se a bateria acabar ou o app fechar, o código é perdido.
**Solução:** Salvar `code` no `sessionStorage` a cada 3 segundos (debounce). Ao abrir exercício, verificar se há código salvo e oferecer "Continuar de onde parou?".
**Arquivo:** `src/pages/ExercisePage.tsx`, possivelmente um hook `useAutoSave.ts`

### 3.3 Tradução de Erros Expandida
**Problema:** Já existe tradução de erros, mas pode ser melhorada com contexto do assistente.
**Solução:** Quando um erro é capturado, o hint-engine pode sugerir: "Parece que você esqueceu de X" com base no `starterCode` e no erro. Expandir `ERROR_PATTERNS` com mais casos comuns.
**Arquivo:** `src/engine/hint-engine.ts`

---

## Fase 4 — Polish Visual

### 4.1 Contraste e Acessibilidade (WCAG)
**Problema:** Texto ciano/azul sobre fundo roxo pode falhar WCAG em brilho baixo.
**Solução:** Auditar cores com ferramenta de contraste. Ajustar `--color-text-muted` para `#A0AEC0` (cinza azulado) para textos secundários. Manter ciano apenas para CTAs.
**Arquivo:** `src/styles/globals.css`, `tailwind.config.ts`

### 4.2 Gradiente nos Botões de Ação
**Problema:** Botões sólidos são funcionais mas podem ter mais "energia".
**Solução:** Botão "Executar" com gradiente sutil `from-primary to-primary-dark`. Barra de progresso com gradiente de secundário para primário ao completar.
**Arquivo:** `src/components/ui/Button.tsx`, `src/components/ui/ProgressBar.tsx`

### 4.3 Círculo Colorido nos Avatares
**Problema:** Avatares no fundo escuro podem não se destacar.
**Solução:** Adicionar um anel/círculo colorido ao redor do avatar na tela de seleção, cor baseada no ícone.
**Arquivo:** `src/components/ui/Avatar.tsx`

---

## Fase 5 — Funcionalidades Novas (Maior Esforço)

### 5.1 Compartilhamento de Código via URL
**Problema:** Sem backend, não há como compartilhar.
**Solução:** Usar `lz-string` para comprimir código e colocar na URL como query param. Botão "Compartilhar" no Playground gera link copiável. Ao abrir link, Playground carrega o código.
**Arquivo:** `src/pages/PlaygroundPage.tsx`, novo util `src/utils/share.ts`
**Dependência:** npm install lz-string

### 5.2 Compartilhamento de Progresso (Imagem)
**Problema:** Aluno quer mostrar progresso para amigos/pais.
**Solução:** Gerar card de progresso como imagem (usando canvas ou html2canvas). Botão "Compartilhar meu progresso" no Perfil.
**Arquivo:** `src/pages/ProfilePage.tsx`, novo util `src/utils/share-card.ts`
**Dependência:** possivelmente html2canvas

### 5.3 Temas de Syntax Highlighting como Recompensa
**Problema:** Oportunidade de gamificação extra.
**Solução:** Permitir trocar tema do editor (Dracula, Monokai, etc.) usando estrelas como "moeda". Store de temas desbloqueáveis.
**Arquivo:** `src/engine/monaco-theme.ts`, `src/store/settings.store.ts`, nova UI em Settings

### 5.4 Micro-quiz nas Explicações do Assistente
**Problema:** Explicações são passivas — aluno pode não absorver.
**Solução:** Dentro dos diálogos do FakeAssistant, adicionar perguntas rápidas de confirmação ("Entendeu? O que é uma variável?") antes de prosseguir.
**Arquivo:** `src/components/lesson/FakeAssistant.tsx`

---

## Itens Descartados / Adiados

| Sugestão | Motivo para adiar |
|---|---|
| Trilha estilo Candy Crush / mapa geográfico | Rewrite completo do HomePage, alto custo vs. benefício atual |
| Nome/personalidade do robô ("Byte") | Requer mudança nos JSONs de conteúdo (não modificáveis) |
| Sons diferenciados por acerto/erro | Já existe toggle de som; refinar depois do básico estar 100% |
| Paleta alternativa (Cyberpunk/Dracula/Friendly) | A paleta atual está definida no CLAUDE.md como obrigatória |
| "Transformar em Projeto" (exercício → playground) | Complexidade alta, melhor como v2 |
| Sistema de vidas com timer visual | Já implementado no store, apenas UI de countdown faltaria |

---

## Ordem de Execução Sugerida

```
Fase 1 (1-2 dias) → Fase 2 (1 dia) → Fase 3 (1-2 dias) → Fase 4 (meio dia) → Fase 5 (2-3 dias)
```

Total estimado: ~7-9 dias de trabalho.

---

## Notas

- Nenhuma das mudanças modifica os JSONs de conteúdo em `public/content/`
- Todas as mudanças são incrementais e podem ser feitas em PRs separadas
- Priorizar mobile-first nas Fases 1 e 3
- Testar acessibilidade (contraste) com DevTools Lighthouse após Fase 4
