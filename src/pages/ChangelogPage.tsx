import { motion } from 'framer-motion';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.12.0',
    date: '2026-06-07',
    changes: [
      'Botão de feedback adicionado à barra superior em telas menores',
      'Dica sobre feedback no modal de informações da página',
    ],
  },
  {
    version: '1.11.0',
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
