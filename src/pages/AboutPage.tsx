import { motion } from 'framer-motion';

export function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#E8E8F0]">Sobre o CodeQuest</h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-surface border border-bg-elevated rounded-2xl p-6 space-y-4"
      >
        <div className="text-center mb-2">
          <span className="text-4xl">⚡</span>
          <h2 className="font-heading font-bold text-primary text-xl mt-2">CodeQuest</h2>
          <p className="text-[#8888AA] font-body text-sm">v{__APP_VERSION__}</p>
        </div>

        <div className="space-y-3 font-body text-sm text-[#E8E8F0] leading-relaxed">
          <p>
            CodeQuest é uma plataforma educacional para aprender <strong className="text-primary">lógica de programação com TypeScript</strong> de forma prática e divertida.
          </p>
          <p>
            Inspirado em jogos e apps de aprendizado, o CodeQuest transforma o aprendizado de programação em uma jornada interativa com exercícios práticos, quizzes e desafios.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-bg-surface border border-bg-elevated rounded-2xl p-6 space-y-4"
      >
        <h2 className="font-heading font-semibold text-[#E8E8F0]">Como usar</h2>
        <ul className="space-y-3 font-body text-sm text-[#E8E8F0]">
          {[
            { icon: '🗺️', text: 'Siga a trilha de módulos na Jornada, do iniciante ao avançado' },
            { icon: '📖', text: 'Leia as lições de teoria com exemplos interativos' },
            { icon: '💻', text: 'Resolva exercícios escrevendo código real no editor' },
            { icon: '🧪', text: 'Seu código é compilado e testado automaticamente no navegador' },
            { icon: '💡', text: 'Use dicas quando precisar de ajuda (mas tente antes!)' },
            { icon: '⭐', text: 'Ganhe estrelas, XP e troféus conforme avança' },
          ].map((item) => (
            <li key={item.text} className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-bg-surface border border-bg-elevated rounded-2xl p-6"
      >
        <p className="text-xs text-[#8888AA] font-body text-center">
          100% client-side. Seu código roda no navegador com total privacidade.
        </p>
      </motion.div>
    </div>
  );
}
