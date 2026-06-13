export interface SymbolToolbarProps {
  onInsert: (symbol: string) => void;
}

const SYMBOLS = [
  '{', '}', '(', ')', '[', ']', ';', ':', '=', '+', '-', '"', "'",
  '>', '<', '/', '!', '|', '&', '—',
];

export function SymbolToolbar({ onInsert }: SymbolToolbarProps) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 px-2 py-2 bg-bg-surface border-b border-bg-elevated md:hidden">
      {SYMBOLS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onInsert(s)}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-bg-elevated text-text-main font-mono text-base hover:bg-primary/20 hover:text-primary active:scale-90 transition-all"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
