import type { CSSProperties, ReactNode } from 'react';

interface IconProps {
  className?: string;
  size?: number;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

type IconComponent = (props: IconProps) => ReactNode;

function emoji(char: string): IconComponent {
  return function EmojiIcon({ className = '', size, style, ...aria }: IconProps) {
    return (
      <span
        role="img"
        className={`inline-flex items-center justify-center leading-none select-none ${className}`}
        style={{ fontSize: size ? `${size}px` : undefined, ...style }}
        {...aria}
      >
        {char}
      </span>
    );
  };
}

function symbol(char: string): IconComponent {
  return function SymbolIcon({ className = '', size, style, ...aria }: IconProps) {
    return (
      <span
        className={`inline-flex items-center justify-center leading-none ${className}`}
        style={{ fontSize: size ? `${size}px` : undefined, ...style }}
        aria-hidden="true"
        {...aria}
      >
        {char}
      </span>
    );
  };
}

// ---------------------------------------------------------------------------
// Icon Registry
//
// Cada entrada mapeia um nome semântico para um componente.
// Para trocar um emoji por SVG/Lucide, basta alterar a implementação aqui.
// Nenhum arquivo consumidor precisa mudar.
// ---------------------------------------------------------------------------

export const icons = {

  // -- Brand / App ---------------------------------------------------------
  bolt:            emoji('⚡'),     // logo CodeQuest
  rocket:          emoji('🚀'),     // CTA de início

  // -- Navigation ----------------------------------------------------------
  map:             emoji('🗺️'),    // Jornada / mapa
  flask:           emoji('🧪'),     // Playground
  person:          emoji('👤'),     // Perfil
  info:            emoji('ℹ️'),     // Sobre
  changelog:       emoji('📋'),     // Changelog / copiar
  gear:            emoji('⚙️'),     // Configurações
  arrowRight:      symbol('→'),     // Próximo / Continuar
  arrowLeft:       symbol('←'),     // Anterior / Voltar
  play:            symbol('▶'),     // Executar código
  playBack:        symbol('◀'),     // Voltar (nav)
  skipForward:     symbol('⏭'),     // Pular exercício
  chevronUp:       symbol('▲'),     // Expandir
  chevronDown:     symbol('▼'),     // Colapsar
  chevronSmDown:   symbol('▾'),     // Dropdown

  // -- Status / Feedback ---------------------------------------------------
  checkCircle:     emoji('✅'),     // Sucesso / completo
  check:           symbol('✓'),     // Concluído (inline)
  cross:           emoji('❌'),     // Erro / incorreto
  close:           symbol('✕'),     // Fechar modal
  warning:         emoji('⚠️'),     // Aviso / erro

  // -- Gamification --------------------------------------------------------
  fire:            emoji('🔥'),     // Streak
  star:            emoji('⭐'),     // Estrela (conquista, dificuldade)
  starEmpty:       symbol('☆'),     // Estrela vazia
  starFilled:      symbol('★'),     // Estrela cheia (rarity legendary)
  diamond:         symbol('◆'),     // Rarity rare
  circle:          symbol('●'),     // Rarity uncommon
  trophy:          emoji('🏆'),     // Desafio / conquista
  party:           emoji('🎉'),     // Celebração
  levelUp:         emoji('⬆️'),     // Subiu de nível
  gamepad:         emoji('🎮'),     // Gamificação

  // -- Learning ------------------------------------------------------------
  book:            emoji('📖'),     // Teoria
  laptop:          emoji('💻'),     // Exercício / código
  bulb:            emoji('💡'),     // Dica
  lock:            emoji('🔒'),     // Trancado
  robot:           emoji('🤖'),     // Assistente IA
  memo:            emoji('📝'),     // Resumo / notas
  books:           emoji('📚'),     // Info geral
  refresh:         emoji('🔄'),     // Resetar / re-explicar
  speech:          emoji('💬'),     // Feedback
  target:          emoji('🎯'),     // Jogo de adivinhação
  abacus:          emoji('🧮'),     // Template calculadora
  sound:           emoji('🔊'),     // Som

  // -- Files / Playground --------------------------------------------------
  folder:          emoji('📂'),     // Pasta aberta
  folderClosed:    emoji('📁'),     // Pasta fechada
  document:        emoji('📄'),     // Novo documento
  save:            emoji('💾'),     // Salvar
  trash:           emoji('🗑️'),    // Excluir
  broom:           emoji('🧹'),     // Limpar console
  pencil:          emoji('✏️'),     // Editar

  // -- Achievements (usados em achievements.json) --------------------------
  package:         emoji('📦'),     // Primeira variável
  puzzle:          emoji('🧩'),     // Mestre dos tipos
  shuffle:         emoji('🔀'),     // Tomador de decisões
  construction:    emoji('🏗️'),    // Arquiteto de objetos
  brain:           emoji('🧠'),     // FizzBuzz master
  strength:        emoji('💪'),     // Sem ajuda
  graduation:      emoji('🎓'),     // Gênio independente
  crown:           emoji('👑'),     // Mestre do código

  // -- Misc ----------------------------------------------------------------
  minus:           symbol('−'),     // Custo de dica (−1★)

  // -- Avatars -------------------------------------------------------------
  // Usados também via Avatar component, mas listados aqui para referência.
  avatarRobot1:    emoji('🤖'),
  avatarRobot2:    emoji('🦾'),
  avatarWizard:    emoji('🧙'),
  avatarNinja:     emoji('🥷'),
  avatarAstronaut: emoji('👨‍🚀'),
  avatarScientist: emoji('🧪'),
  avatarHacker:    emoji('💻'),
  avatarDragon:    emoji('🐉'),

} as const satisfies Record<string, IconComponent>;

export type IconName = keyof typeof icons;
export type { IconProps, IconComponent };

// ---------------------------------------------------------------------------
// Reverse lookup: emoji char → IconName
// Permite resolver emojis vindos de fontes externas (ex: achievements.json)
// ---------------------------------------------------------------------------

const EMOJI_TO_ICON: Record<string, IconName> = {
  '⚡': 'bolt',
  '🚀': 'rocket',
  '🗺️': 'map',
  '🧪': 'flask',
  '👤': 'person',
  'ℹ️': 'info',
  '📋': 'changelog',
  '⚙️': 'gear',
  '✅': 'checkCircle',
  '❌': 'cross',
  '⚠️': 'warning',
  '🔥': 'fire',
  '⭐': 'star',
  '🏆': 'trophy',
  '🎉': 'party',
  '⬆️': 'levelUp',
  '🎮': 'gamepad',
  '📖': 'book',
  '💻': 'laptop',
  '💡': 'bulb',
  '🔒': 'lock',
  '🤖': 'robot',
  '📝': 'memo',
  '📚': 'books',
  '🔄': 'refresh',
  '💬': 'speech',
  '🎯': 'target',
  '🧮': 'abacus',
  '🔊': 'sound',
  '📂': 'folder',
  '📁': 'folderClosed',
  '📄': 'document',
  '💾': 'save',
  '🗑️': 'trash',
  '🧹': 'broom',
  '✏️': 'pencil',
  '📦': 'package',
  '🧩': 'puzzle',
  '🔀': 'shuffle',
  '🏗️': 'construction',
  '🧠': 'brain',
  '💪': 'strength',
  '🎓': 'graduation',
  '👑': 'crown',
  '🐉': 'avatarDragon',
  '🦾': 'avatarRobot2',
  '🧙': 'avatarWizard',
  '🥷': 'avatarNinja',
  '👨‍🚀': 'avatarAstronaut',
};

export function resolveIcon(emojiOrName: string): IconComponent {
  if (emojiOrName in icons) return icons[emojiOrName as IconName];
  const name = EMOJI_TO_ICON[emojiOrName];
  if (name) return icons[name];
  return emoji(emojiOrName);
}
