import { motion } from 'framer-motion';
import { icons } from '@/components/ui/Icon';
import { CompletionCard } from '@/components/lesson/CompletionCard';
import type { ExerciseLesson } from '@/content/curriculum.types';

export interface SuccessOverlayProps {
  lesson: ExerciseLesson;
  stars: number;
  hintsUsed: number;
  xpGained: number;
  onNext: () => void;
  onMap: () => void;
}

function starsExplanation(stars: number, hintsUsed: number): string {
  if (stars === 3) return 'Sem dicas — perfeito!';
  if (hintsUsed === 1) return 'Você usou 1 dica';
  return `Você usou ${hintsUsed} dicas`;
}

export function SuccessOverlay({ lesson, stars, hintsUsed, xpGained, onNext, onMap }: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    >
      <CompletionCard
        icon={<icons.party />}
        context="exercise"
        title="Exercício concluído!"
        subtitle={lesson.title}
        stars={stars}
        starSize="md"
        xpReward={xpGained}
        onNext={onNext}
        onMap={onMap}
      >
        <p className="text-xs text-text-muted font-body">
          {starsExplanation(stars, hintsUsed)}
        </p>
      </CompletionCard>
    </motion.div>
  );
}
