# Plano de Implementação — Melhorias UX/UI (Relatório de Análise)

Baseado no relatório de análise UX/UI, organizado por prioridade e impacto.

---

## Concluído

| Item | Descrição | Implementação |
|---|---|---|
| 1.1 | Barra de Símbolos Mobile | `SymbolToolbar.tsx` integrado em ExercisePage e PlaygroundPage |
| 1.2 | Feedback Console Vazio | OutputPanel mostra "Executado com sucesso" quando passed sem output |
| 1.3 | Confirmação Reforçada Reset | Digitar "APAGAR" + mostra stats que serão perdidos |
| 1.4 | Aviso de Persistência Local | Aviso no AboutPage sobre dados salvos no navegador |
| 2.1 | Frases Motivacionais | 10 frases aleatórias no SuccessOverlay |
| 2.2 | Troféus com Vida Visual | Diferenciação por raridade (glow, ícones, cores) |
| 2.3 | Destaque Próxima Lição | `isNext` com highlight visual no HomePage |
| 3.1 | Sublinhado de Erro no Editor | Monaco markers via `getLastCompileErrors()` |
| 3.2 | Auto-save do Código | sessionStorage com debounce + banner de recuperação |
| 3.3 | Tradução de Erros Expandida | +13 novos padrões em ERROR_PATTERNS |
| 4.2 | Gradiente nos Botões | Gradiente sutil from-primary to-primary-dark |

---

## Concluído — Polish Visual (Fase 4)

### 4.1 Contraste e Acessibilidade (WCAG) ✓
**Solução:** `--color-text-muted` atualizado de `#8888AA` para `#A0AEC0`. Token Tailwind `text-text-muted` criado e aplicado em 23 arquivos. Monaco theme atualizado.

### 4.3 Círculo Colorido nos Avatares ✓
**Solução:** Mapa `AVATAR_RING_COLORS` com cores por avatar (primary, accent, secondary, warning). Borda `border-2` com 30% de opacidade.

---

## Pendente — Funcionalidades Novas (Fase 5)

### 5.2 Compartilhamento de Progresso (Imagem) ✓
**Solução:** Canvas API puro (sem dependência). Card 640x340 com avatar, nome, nível, barra de XP, e stats (ofensiva, estrelas, lições, troféus). Usa `navigator.share()` em mobile, fallback para download. Botão no ProfilePage.
**Arquivos:** `src/utils/share-card.ts`, `src/pages/ProfilePage.tsx`

### 5.3 Temas de Syntax Highlighting + Modo Claro ✓
**Solução:** 5 temas de editor gratuitos (CodeQuest, Dracula, Monokai, GitHub Light, Solarized). Modo claro do app com CSS variables RGB + `data-theme`. Selects no Settings para aparência e tema do editor. highlight.js adaptado para light mode.
**Arquivos:** `src/engine/monaco-theme.ts`, `src/store/settings.store.ts`, `src/styles/globals.css`, `tailwind.config.ts`, `src/app/App.tsx`, `src/pages/SettingsPage.tsx`, `src/pages/ExercisePage.tsx`, `src/pages/PlaygroundPage.tsx`

### 5.4 Micro-quiz nas Explicações do Assistente (aguardando aprovação)
**Problema:** Explicações são passivas — aluno pode não absorver.
**Solução:** Dentro dos diálogos do FakeAssistant, adicionar perguntas rápidas de confirmação ("Entendeu? O que é uma variável?") antes de prosseguir.
**Arquivo:** `src/components/lesson/FakeAssistant.tsx`

---

## Itens Descartados

| Sugestão | Motivo |
|---|---|
| Trilha estilo Candy Crush / mapa geográfico | Rewrite completo do HomePage, alto custo vs. benefício |
| Paleta alternativa (Cyberpunk/Dracula/Friendly) | Paleta definida no CLAUDE.md como obrigatória |
| "Transformar em Projeto" (exercício → playground) | Complexidade alta, melhor como v2 |
| Sistema de vidas | Removido intencionalmente do projeto |
| Nome "Byte" para o robô | Assistente já tem identidade como "Cody" |
| Compartilhamento de código via URL (5.1) | Funcionalidade descartada pelo usuário |

---

## Notas

- Nenhuma das mudanças modifica os JSONs de conteúdo em `public/content/`
- Testar acessibilidade (contraste) com DevTools Lighthouse para 4.1
