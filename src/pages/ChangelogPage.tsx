import { motion } from 'framer-motion';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.21.0',
    date: '2026-06-10',
    changes: [
      'Tema claro disponível — escolha entre Escuro e Claro nas Configurações',
      '5 temas de editor para escolher: CodeQuest, Dracula, Monokai, GitHub Light e Solarized',
      'Barra de símbolos no celular — toque para inserir {, (, ;, = e outros direto no editor',
      'Seu código é salvo automaticamente enquanto você digita — se sair do exercício, ele estará lá quando voltar',
      'Erros de compilação aparecem sublinhados no editor, na linha exata do problema',
      'Resetar progresso agora pede confirmação digitando "APAGAR" e mostra o que será perdido',
      'Botão "Compartilhar Progresso" no perfil — gera uma imagem com suas conquistas',
      'Novos avatares: pinguim, arco-íris, olho grego e pedra',
      'Mensagens de erro mais amigáveis para strings não fechadas, constantes, arrays e mais',
    ],
  },
  {
    version: '0.20.0',
    date: '2026-06-09',
    changes: [
      'Botão "Copiar" no editor — copie seu código com um clique no Playground e nos exercícios',
      'Feedback visual "Copiado!" confirma que o código foi para a área de transferência',
    ],
  },
  {
    version: '0.19.0',
    date: '2026-06-09',
    changes: [
      'Ícones maiores e mais legíveis em toda a interface',
      'Botão de ajuda agora usa ícone de interrogação em vez de "i"',
      'Botão de tamanho de fonte com ícone visual em vez de "A"',
      'Novo avatar de café disponível na seleção de perfil',
      'Modelos no Playground com ícone de múltiplas folhas no menu mobile',
    ],
  },
  {
    version: '0.18.0',
    date: '2026-06-09',
    changes: [
      'Ícones mais bonitos e detalhados em toda a interface — raio, foguete, fogo, estrela, troféu, festa, cadeado e som',
      'O assistente agora se chama Cody e tem um rosto próprio em toda a interface',
      'Estrela vazia agora aparece corretamente no modo escuro',
    ],
  },
  {
    version: '0.17.0',
    date: '2026-06-08',
    changes: [
      'Ícones da interface redesenhados — mais nítidos e consistentes',
      'Blocos de código agora mostram número das linhas',
      'No celular, as instruções do exercício aparecem como comentário dentro do editor',
    ],
  },
  {
    version: '0.16.0',
    date: '2026-06-08',
    changes: [
      'Ícones e avatares com visual unificado em todas as telas',
      'Conquistas, level-up e ofensiva agora mostram ícones ao invés de texto',
    ],
  },
  {
    version: '0.15.0',
    date: '2026-06-07',
    changes: [
      'Menu lateral aberto por padrão no computador',
      'Menu lateral fecha sozinho ao entrar num exercício',
      'Botão Assistente visível em todas as telas',
      'Instruções do exercício mais largas no computador',
      'Interface das lições mais limpa',
    ],
  },
  {
    version: '0.14.0',
    date: '2026-06-07',
    changes: [
      'Nome "CodeQuest" visível no topo em qualquer tamanho de tela',
      'Menu lateral controlado pelo botão Menu',
      'Interface dos exercícios mais limpa e focada no código',
    ],
  },
  {
    version: '0.13.0',
    date: '2026-06-07',
    changes: [
      'Página de Changelog adicionada ao menu',
      'Playground com menu mais compacto no celular',
      'Navegação das lições fixa no rodapé — não some ao rolar',
      'Barra "Abrir Editor" fixa no rodapé sem cortar conteúdo',
    ],
  },
  {
    version: '0.12.0',
    date: '2026-06-07',
    changes: [
      'Botão de feedback acessível pelo topo da tela',
    ],
  },
  {
    version: '0.11.0',
    date: '2026-06-06',
    changes: [
      'Formulário de feedback — envie sugestões direto pelo app',
      'Código no editor mais legível (sem ligaduras)',
      'XP atual e total visíveis na barra de progresso do perfil',
    ],
  },
];

export function ChangelogPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-bold text-text-main">
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
            <span className="text-xs text-text-muted font-body">
              {entry.date}
            </span>
          </div>

          <ul className="space-y-2">
            {entry.changes.map((change) => (
              <li
                key={change}
                className="flex items-start gap-2 font-body text-sm text-text-main leading-relaxed"
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
