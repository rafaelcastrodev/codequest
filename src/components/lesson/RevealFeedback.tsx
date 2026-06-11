import { motion, AnimatePresence } from "framer-motion";
import { RichText } from "@/components/ui/RichText";
import { icons } from "@/components/ui/Icon";

interface RevealFeedbackProps {
  revealed: boolean;
  isCorrect: boolean;
  explanation: string;
  successLabel?: string;
  failLabel?: string;
}

export function RevealFeedback({
  revealed,
  isCorrect,
  explanation,
  successLabel = "Isso mesmo!",
  failLabel = "Não era essa!",
}: RevealFeedbackProps) {
  return (
    <AnimatePresence>
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 border ${
            isCorrect
              ? "bg-primary/10 border-primary/30"
              : "bg-accent/10 border-accent/30"
          }`}
        >
          <p className="font-body text-sm font-semibold mb-1">
            {isCorrect ? (
              <>
                <icons.checkCircle /> {successLabel}
              </>
            ) : (
              <>
                <icons.cross /> {failLabel}
              </>
            )}
          </p>
          <RichText
            content={explanation}
            className="font-body text-sm text-text-main leading-relaxed"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
