import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

type ButtonSize = "sm" | "md" | "lg";

interface ConfirmButtonProps {
  visible: boolean;
  onClick: () => void;
  label?: string;
  size?: ButtonSize;
  className?: string;
}

export function ConfirmButton({
  visible,
  onClick,
  label = "Conferir",
  size = "sm",
  className = "",
}: ConfirmButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`flex justify-end pt-6 ${className}`}
        >
          <Button variant="primary" size={size} onClick={onClick}>
            {label}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
