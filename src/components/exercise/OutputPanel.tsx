export interface OutputPanelProps {
  output: string;
  errorMessage: string | null;
  mistakeMessage: string | null;
  status: string;
}

export function OutputPanel({ output, errorMessage, mistakeMessage, status }: OutputPanelProps) {
  const isEmpty = !output && !errorMessage && !mistakeMessage;

  return (
    <div className="bg-[#0A0A15] border border-bg-elevated rounded-xl overflow-hidden h-40 flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-bg-elevated flex-shrink-0">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
        </div>
        <span className="text-xs text-[#8888AA] font-mono">console</span>
        {status === 'running' && (
          <span className="ml-auto text-xs text-[#8888AA] font-body animate-pulse">executando...</span>
        )}
      </div>
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {isEmpty && (
          <p className="text-[#8888AA] font-mono text-xs opacity-50">
            Clique em ▶ Executar para ver a saída aqui
          </p>
        )}
        {mistakeMessage && (
          <p className="text-warning font-mono text-xs leading-relaxed">⚠️ {mistakeMessage}</p>
        )}
        {errorMessage && !mistakeMessage && (
          <pre className="text-accent font-mono text-xs leading-relaxed whitespace-pre-wrap">❌ {errorMessage}</pre>
        )}
        {output && (
          <pre className={`font-mono text-xs leading-relaxed whitespace-pre-wrap ${status === 'passed' ? 'text-primary' : 'text-[#E8E8F0]'}`}>
            {status === 'passed' ? '✅ ' : '📋 '}{output}
          </pre>
        )}
      </div>
    </div>
  );
}
