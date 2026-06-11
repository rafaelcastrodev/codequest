import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface NarrativeIntroProps {
  text: string;
  onDismiss: () => void;
}

export function NarrativeIntro({ text, onDismiss }: NarrativeIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    >
      <div className="max-w-lg w-full bg-bg-surface border border-bg-elevated rounded-2xl p-8 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-body text-text-main text-lg leading-relaxed">
            {text}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button variant="primary" size="lg" onClick={onDismiss}>
            Vamos nessa!
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface LessonNarrativeBannerProps {
  text: string;
}

export function LessonNarrativeBanner({ text }: LessonNarrativeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-l-2 border-secondary/50 pl-4 py-1 mb-2"
    >
      <p className="font-body text-text-muted text-sm italic leading-relaxed">
        {text}
      </p>
    </motion.div>
  );
}
