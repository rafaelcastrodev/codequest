import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { icons } from '@/components/ui/Icon';
import type { ExerciseLesson } from '@/content/curriculum.types';

function XPCounter({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
      className="bg-secondary/20 border border-secondary/30 rounded-xl px-4 py-2 mb-6 inline-block"
    >
      <motion.span
        className="text-secondary font-heading font-bold text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        +{xp} XP
      </motion.span>
    </motion.div>
  );
}

export interface SuccessOverlayProps {
  lesson: ExerciseLesson;
  stars: number;
  onNext: () => void;
  onMap: () => void;
}

export function SuccessOverlay({ lesson, stars, onNext, onMap }: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-bg-surface border border-primary/40 rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(0,212,170,0.2)]"
      >
        <div className="text-5xl mb-3"><icons.party /></div>
        <h2 className="font-heading text-2xl font-bold text-primary mb-1">Incrível!</h2>
        <p className="text-[#8888AA] font-body text-sm mb-4">{lesson.title}</p>

        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.span
              key={s}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: s * 0.1, type: 'spring', stiffness: 400 }}
              className="text-2xl"
            >
              {s <= stars ? <icons.star /> : <icons.starEmpty />}
            </motion.span>
          ))}
        </div>

        <XPCounter xp={lesson.xpReward} />

        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onMap}>
            <icons.map /> Jornada
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={onNext}>
            Próximo <icons.arrowRight />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
