import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface ChoiceListProps {
  options: string[];
  selected: number | null;
  correctIndex: number;
  revealed: boolean;
  onSelect: (idx: number) => void;
  renderLabel?: (option: string, idx: number) => ReactNode;
  fontClass?: string;
}

function resolveClasses(
  idx: number,
  selected: number | null,
  correctIndex: number,
  revealed: boolean,
): { borderClass: string; bgClass: string; textClass: string } {
  if (revealed) {
    if (idx === correctIndex) {
      return {
        borderClass: "border-primary/60",
        bgClass: "bg-primary/10",
        textClass: "text-primary",
      };
    }
    if (idx === selected && selected !== correctIndex) {
      return {
        borderClass: "border-accent/60",
        bgClass: "bg-accent/10",
        textClass: "text-accent",
      };
    }
    return {
      borderClass: "border-bg-elevated/50",
      bgClass: "bg-bg-surface/50",
      textClass: "text-text-muted",
    };
  }

  if (idx === selected) {
    return {
      borderClass: "border-secondary/60",
      bgClass: "bg-secondary/10",
      textClass: "text-text-main",
    };
  }

  return {
    borderClass: "border-bg-elevated hover:border-primary/40",
    bgClass: "bg-bg-surface hover:bg-bg-elevated",
    textClass: "text-text-main",
  };
}

export function ChoiceList({
  options,
  selected,
  correctIndex,
  revealed,
  onSelect,
  renderLabel,
  fontClass = "font-mono text-sm",
}: ChoiceListProps) {
  return (
    <div className="space-y-2">
      {options.map((option, idx) => {
        const { borderClass, bgClass, textClass } = resolveClasses(
          idx,
          selected,
          correctIndex,
          revealed,
        );

        return (
          <motion.button
            key={idx}
            whileHover={!revealed ? { scale: 1.01 } : {}}
            whileTap={!revealed ? { scale: 0.99 } : {}}
            onClick={() => onSelect(idx)}
            disabled={revealed}
            className={`
              w-full text-left px-4 py-2.5 rounded-xl border transition-all
              ${fontClass}
              ${bgClass} ${borderClass} ${textClass}
              ${!revealed ? "cursor-pointer" : "cursor-default"}
            `}
          >
            {renderLabel ? renderLabel(option, idx) : option}
          </motion.button>
        );
      })}
    </div>
  );
}
