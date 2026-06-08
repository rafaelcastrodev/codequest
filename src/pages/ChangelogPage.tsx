import { motion } from 'framer-motion';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.14.0',
    date: '2026-06-07',
    changes: [
      'Header com nome "CodeQuest" visível em todas as resoluções',
      'Sidebar controlada pelo botão Menu (show/hide) em desktop',
      'Sidebar se esconde automaticamente ao entrar em exercícios (>1024px)',
      'Removido texto "Passo X de Y" da tela de lição',
      'Removido botão "Sair" das telas de lição e exercício',
      'Removido rótulo "student.ts" da barra do editor',
      'Removida barra de ações (Assistente, A, i) da tela de exercício',
      'Botão Assistente visível na barra do editor em desktop',
    ],
  },
  {
    version: '0.13.1',
    date: '2026-06-07',
    changes: [
      'Removido componente BottomNav (não utilizado)',
      'Removido hook useProgress (não utilizado)',
      'Session store simplificada: removidos campos e métodos órfãos',
      'Função isCodeContent extraída para utilitário compartilhado',
      'Corrigido warning de ESLint no useEffect da HomePage',
    ],
  },
  {
    version: '0.13.0',
    date: '2026-06-07',
    changes: [
      'Página de Changelog adicionada ao menu lateral',
      'Playground: itens de menu agrupados num modal abaixo de 640px',
      'Playground: troca de texto para ícones agora ocorre em 768px',
      'Exercícios: ícone de prancheta substitui seta de voltar no mobile',
      'Exercícios: barra de ações (A, i, Sair) movida para linha abaixo do título',
      'Exercícios: botão Assistente reposicionado na barra de ações',
      'Lições: barra de navegação (Anterior/Próximo) fixa no rodapé',
      'Lições: card "Teoria Concluída" centralizado como modal',
      'Exercícios: barra "Abrir Editor" fixa no rodapé sem cortar conteúdo',
      'Versão corrigida para 0.x (beta)',
    ],
  },
  {
    version: '0.12.0',
    date: '2026-06-07',
    changes: [
      'Botão de feedback adicionado à barra superior em telas menores',
      'Botão de feedback com destaque roxo (estilo FAB)',
      'Dica sobre feedback no modal de informações da página',
    ],
  },
  {
    version: '0.11.0',
    date: '2026-06-06',
    changes: [
      'Formulário de feedback integrado ao Google Sheets',
      'Ligaduras de fonte desativadas no editor e blocos de código',
      'XP atual/total exibido dentro da barra de progresso no perfil',
      'Botões de tamanho de fonte e info movidos para a barra desktop',
    ],
  },
];

export function ChangelogPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#E8E8F0]">
        Changelog
      </h1>

      {CHANGELOG.map((entry, idx) => (
        <motion.div
          key={entry.version}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06 }}
          className="bg-bg-surface border border-bg-elevated rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-primary text-lg">
              v{entry.version}
            </span>
            <span className="text-xs text-[#8888AA] font-body">
              {entry.date}
            </span>
          </div>

          <ul className="space-y-2">
            {entry.changes.map((change) => (
              <li
                key={change}
                className="flex items-start gap-2 font-body text-sm text-[#E8E8F0] leading-relaxed"
              >
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
