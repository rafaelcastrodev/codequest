import { useState, useCallback } from "react";

interface RevealableChoiceState {
  selected: number | null;
  revealed: boolean;
  isCorrect: boolean;
  handleSelect: (idx: number) => void;
  handleConfirm: () => void;
}

export function useRevealableChoice(correctIndex: number): RevealableChoiceState {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const isCorrect = selected === correctIndex;

  const handleSelect = useCallback(
    (idx: number) => {
      if (!revealed) setSelected(idx);
    },
    [revealed],
  );

  const handleConfirm = useCallback(() => {
    if (selected !== null && !revealed) setRevealed(true);
  }, [selected, revealed]);

  return { selected, revealed, isCorrect, handleSelect, handleConfirm };
}
