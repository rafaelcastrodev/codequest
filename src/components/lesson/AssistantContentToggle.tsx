import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AssistantContentNav } from "@/components/lesson/FakeAssistant";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { RichText } from "@/components/ui/RichText";
import { isCodeContent } from "@/utils/is-code-content";
import type { AssistantAction } from "@/hooks/useAssistant";

const slideVariants = {
  enterFromRight: { opacity: 0, x: 40 },
  enterFromLeft: { opacity: 0, x: -40 },
  center: { opacity: 1, x: 0 },
  exitToLeft: { opacity: 0, x: -40 },
  exitToRight: { opacity: 0, x: 40 },
};

interface AssistantContentViewProps {
  content: string;
  className?: string;
}

function AssistantContentView({ content, className }: AssistantContentViewProps) {
  if (isCodeContent(content)) {
    return <CodeBlock code={content} />;
  }
  return (
    <RichText
      content={content}
      className={className ?? "text-text-main font-body leading-relaxed text-base"}
    />
  );
}

interface AssistantContentToggleProps {
  showingAssistant: boolean;
  activeContent: string | null;
  activeAction: AssistantAction | null;
  onShowOriginal: () => void;
  onShowAssistant: () => void;
  assistantClassName?: string;
  assistantWrapper?: "plain" | "elevated";
  children: ReactNode;
}

export function AssistantContentToggle({
  showingAssistant,
  activeContent,
  activeAction,
  onShowOriginal,
  onShowAssistant,
  assistantClassName,
  assistantWrapper = "plain",
  children,
}: AssistantContentToggleProps) {
  const wrapperClass =
    assistantWrapper === "elevated"
      ? "bg-bg-elevated rounded-xl p-4 space-y-2"
      : "";

  return (
    <>
      <AssistantContentNav
        showingAssistant={showingAssistant}
        hasAssistantContent={activeContent !== null}
        activeAction={activeAction}
        onShowOriginal={onShowOriginal}
        onShowAssistant={onShowAssistant}
      />
      <AnimatePresence mode="wait">
        {showingAssistant && activeContent ? (
          <motion.div
            key={`assistant-${activeContent}`}
            variants={slideVariants}
            initial="enterFromRight"
            animate="center"
            exit="exitToRight"
            transition={{ duration: 0.2 }}
            className={wrapperClass}>
            <AssistantContentView
              content={activeContent}
              className={assistantClassName}
            />
          </motion.div>
        ) : (
          <motion.div
            key="original-content"
            variants={slideVariants}
            initial="enterFromLeft"
            animate="center"
            exit="exitToLeft"
            transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
