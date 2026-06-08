# Candidatos a SVG customizado

Ícones que mais se beneficiam de arte própria — seja por identidade de marca, visibilidade alta na UI, ou falta de equivalente vetorial adequado. Atualmente todos usam Lucide (ou emoji, no caso dos avatares).

## Prioridade 1 — Avatares (emoji, sem Lucide)

Representam a identidade do jogador. Lucide não tem equivalente. São os únicos ícones que ainda renderizam emoji no app.

| IconName | Emoji atual | Contexto |
|---|---|---|
| `avatarRobot1` | 🤖 | Avatar padrão |
| `avatarRobot2` | 🦾 | Avatar braço mecânico |
| `avatarWizard` | 🧙 | Avatar mago |
| `avatarNinja` | 🥷 | Avatar ninja |
| `avatarAstronaut` | 👨‍🚀 | Avatar astronauta |
| `avatarScientist` | 🧪 | Avatar cientista |
| `avatarHacker` | 💻 | Avatar hacker |
| `avatarDragon` | 🐉 | Avatar dragão |

**Por quê:** avatares são a peça mais pessoal da UI. SVGs ilustrados (estilo flat/linha com a paleta do app) dariam personalidade que emoji genérico não entrega. Cada avatar pode ter variação de cor usando `currentColor` ou CSS custom properties.

## Prioridade 2 — Marca e gamificação (Lucide, mas genéricos)

Ícones que aparecem constantemente e definem a identidade visual do CodeQuest. SVGs custom com a paleta neon do app teriam impacto imediato.

| IconName | Lucide atual | Onde aparece | Por que trocar |
|---|---|---|---|
| `bolt` | `Zap` | Logo no header, tela de boas-vindas, About | É o ícone do app. Um raio custom com glow verde seria a cara da marca |
| `fire` | `Flame` | Streak no header, toasts, perfil | Ícone mais visto depois do logo. Animação SVG (flicker) elevaria o nível do Duolingo |
| `star` | `Star` (filled) | Rating 3 estrelas, conquistas, dificuldade | Central na progressão. Estrela com gradiente purple→green diferenciaria |
| `starEmpty` | `Star` (outline) | Slots vazios no rating | Par visual do `star`, precisa do mesmo estilo |
| `starFilled` | `Star` (filled) | Raridade legendary, custo de dica | Mesmo asset que `star`, reuso direto |
| `trophy` | `Trophy` | Desafios, conquistas desbloqueadas | Momento de celebração — troféu estilizado com brilho reforça recompensa |
| `party` | `PartyPopper` | Overlay de sucesso (exercício + quiz) | Tela mais emocional do app. Confete animado via SVG > ícone estático |
| `rocket` | `Rocket` | CTA "Começar!", onboarding | Primeiro ícone que o usuário vê. Foguete com trail de partículas |

## Prioridade 3 — Diferenciadores de conteúdo

Menos urgentes, mas dariam polish visual nas telas de lição e mapa.

| IconName | Lucide atual | Onde aparece | Por que trocar |
|---|---|---|---|
| `book` | `BookOpen` | Badge de lição teoria, mapa | Livro aberto com páginas em gradiente |
| `laptop` | `Laptop` | Badge de exercício, mapa | Tela do laptop mostrando `</>` |
| `lock` | `Lock` | Módulos trancados no mapa | Cadeado com keyhole brilhante |
| `robot` | `Bot` | Assistente IA nas lições | Rosto de robô amigável, mascote potencial |
| `bulb` | `Lightbulb` | Botão de dica no exercício | Lâmpada com glow amarelo pulsante |

## Não recomendados para SVG custom

Ícones utilitários/navegação onde Lucide já entrega exatamente o esperado:

- Setas (`arrowRight`, `arrowLeft`, `chevronUp`, `chevronDown`, etc.)
- Ações de arquivo (`save`, `trash`, `folder`, `document`, `pencil`)
- Status genérico (`check`, `close`, `warning`, `cross`)
- Navegação (`gear`, `info`, `map`, `skipForward`)
- Achievements temáticos (`brain`, `crown`, `graduation`, `puzzle`, etc.) — a menos que se opte por ilustrações completas para todos os badges

## Especificações técnicas para os SVGs

- **ViewBox:** `0 0 24 24` (compatível com o wrapper `lucide()` existente)
- **Cores:** usar `currentColor` para herdar a cor do contexto, ou CSS custom properties (`--color-primary`, `--color-accent`, etc.) para gradientes
- **Stroke:** `stroke-width="2"` como base, `stroke-linecap="round"` e `stroke-linejoin="round"` para consistência com Lucide
- **Integração:** trocar a entrada no registry de `lucide(Zap)` para um componente SVG importado — zero mudança nos consumidores
