import { CodeBlock } from "@/components/ui/CodeBlock";
import { useRevealableChoice } from "@/hooks/useRevealableChoice";
import { ChoiceList } from "@/components/lesson/ChoiceList";
import { ConfirmButton } from "@/components/lesson/ConfirmButton";
import { RevealFeedback } from "@/components/lesson/RevealFeedback";
import type { InteractiveExampleStep } from "@/content/curriculum.types";

interface PredictBlockProps {
	step: InteractiveExampleStep;
}

export function PredictBlock({ step }: PredictBlockProps) {
	const predict = step.predict!;
	const { selected, revealed, isCorrect, handleSelect, handleConfirm } =
		useRevealableChoice(predict.correctIndex);

	const question = predict.question ?? "O que este código vai imprimir?";

	return (
		<div className="space-y-4">
			<CodeBlock code={step.code} />

			<div className="space-y-3">
				<p className="font-heading text-sm font-semibold text-secondary">
					{question}
				</p>

				<ChoiceList
					options={predict.choices}
					selected={selected}
					correctIndex={predict.correctIndex}
					revealed={revealed}
					onSelect={handleSelect}
				/>

				<ConfirmButton
					visible={!revealed && selected !== null}
					onClick={handleConfirm}
				/>

				<RevealFeedback
					revealed={revealed}
					isCorrect={isCorrect}
					explanation={step.explanation}
				/>
			</div>
		</div>
	);
}
