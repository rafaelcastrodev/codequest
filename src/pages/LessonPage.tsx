import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { loadModule } from "@/content/loader";
import { useProgressStore, getModuleMastery } from "@/store/progress.store";
import { useSettingsStore } from "@/store/settings.store";
import { useAssistant } from "@/hooks/useAssistant";
import { icons } from "@/components/ui/Icon";
import {
	FakeAssistantButton,
	FakeAssistantModal,
} from "@/components/lesson/FakeAssistant";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LessonBreadcrumb } from "@/components/lesson/LessonBreadcrumb";
import { LessonNavBar } from "@/components/lesson/LessonNavBar";
import { CompletionCard } from "@/components/lesson/CompletionCard";
import { AssistantContentToggle } from "@/components/lesson/AssistantContentToggle";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { RichText } from "@/components/ui/RichText";
import { lessonPath } from "@/utils/lesson-path";
import { playSound } from "@/utils/sounds";
import type {
	Module,
	TheoryLesson,
	LessonStep,
} from "@/content/curriculum.types";

interface StepNavProps {
	total: number;
	current: number;
	maxVisited: number;
	onSelect: (index: number) => void;
}

function StepNav({ total, current, maxVisited, onSelect }: StepNavProps) {
	return (
		<div className="flex items-center gap-1.5">
			{Array.from({ length: total }, (_, i) => {
				const isActive = i === current;
				const isVisited = i <= maxVisited;
				return (
					<button
						key={i}
						onClick={() => isVisited && onSelect(i)}
						disabled={!isVisited}
						className={`
              h-2 rounded-full transition-all duration-200
              ${isActive ? "w-6 bg-primary shadow-[0_0_8px_rgba(0,212,170,0.5)]" : "w-2"}
              ${!isActive && isVisited ? "bg-primary/40 hover:bg-primary/70 cursor-pointer" : ""}
              ${!isVisited ? "bg-bg-elevated cursor-default" : ""}
            `}
						aria-label={`Passo ${i + 1}`}
					/>
				);
			})}
		</div>
	);
}

interface StepViewProps {
	step: LessonStep;
}

function StepView({ step }: StepViewProps) {
	if (step.type === "explanation") {
		return (
			<RichText
				content={step.content}
				className="text-text-main font-body leading-relaxed text-base"
			/>
		);
	}

	return (
		<div className="space-y-3">
			<CodeBlock code={step.code} />
			<RichText
				content={step.explanation}
				className="text-text-muted font-body text-sm leading-relaxed"
			/>
		</div>
	);
}

export function LessonPage() {
	const { moduleId, lessonId } = useParams<{
		moduleId: string;
		lessonId: string;
	}>();
	const navigate = useNavigate();
	const { addXP, completeExercise, updateStreak, completedExercises } =
		useProgressStore();
	const { soundEnabled } = useSettingsStore();

	const assistant = useAssistant(moduleId, lessonId);

	const [mod, setMod] = useState<Module | null>(null);
	const [stepIndex, setStepIndex] = useState(0);
	const [maxVisited, setMaxVisited] = useState(0);
	const [completed, setCompleted] = useState(false);
	const [loading, setLoading] = useState(true);
	const [xpGained, setXpGained] = useState(0);
	const xpAwarded = useRef(false);

	useEffect(() => {
		if (!moduleId) return;
		setLoading(true);
		setStepIndex(0);
		setMaxVisited(0);
		setCompleted(false);
		xpAwarded.current = false;
		loadModule(`modules/${moduleId}.json`)
			.then(setMod)
			.finally(() => setLoading(false));
	}, [moduleId]);

	useEffect(() => {
		setMaxVisited((prev) => Math.max(prev, stepIndex));
	}, [stepIndex]);

	if (loading) return <LoadingSpinner />;

	const lesson = mod?.lessons.find((l) => l.id === lessonId);

	if (!lesson || lesson.type !== "theory") {
		return <EmptyState message="Lição não encontrada." />;
	}

	const theoryLesson = lesson as TheoryLesson;
	const steps = theoryLesson.steps;
	const totalSteps = steps.length;
	const currentStep = steps[stepIndex];

	const lessons = mod?.lessons ?? [];
	const currentIdx = lessons.findIndex((l) => l.id === lessonId);
	const nextLesson = lessons[currentIdx + 1];

	function handleComplete() {
		if (!xpAwarded.current && theoryLesson) {
			const isFirstCompletion = !completedExercises[theoryLesson.id];
			const earned = isFirstCompletion ? theoryLesson.xpReward : Math.round(theoryLesson.xpReward * 0.1);
			addXP(earned);
			setXpGained(earned);
			completeExercise(theoryLesson.id, 3, 0);
			updateStreak();
			xpAwarded.current = true;
			if (soundEnabled) playSound("success");
		}
		setCompleted(true);
	}

	function handleNext() {
		if (nextLesson && moduleId) {
			navigate(lessonPath(moduleId, nextLesson));
		} else {
			navigate("/");
		}
	}

	function handleNextStep() {
		if (stepIndex < totalSteps - 1) {
			setStepIndex(stepIndex + 1);
			assistant.clearAssistant();
		} else {
			handleComplete();
		}
	}

	function handlePrevStep() {
		setStepIndex(stepIndex - 1);
		assistant.clearAssistant();
	}

	if (completed) {
		return (
			<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
				<CompletionCard
					icon={<icons.party />}
					context="lesson"
					title="Teoria concluída!"
					subtitle={theoryLesson.title}
					xpReward={xpGained}
					moduleMastery={getModuleMastery(mod?.lessons ?? [], completedExercises)}
					moduleTitle={mod?.title}
					onNext={handleNext}
					onMap={() => navigate("/")}
				/>

				<FakeAssistantModal
					open={assistant.modalOpen}
					onClose={assistant.closeModal}
					onRequest={assistant.request}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="flex-1 overflow-y-auto scrollbar-thin">
				<div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6 min-w-0">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<LessonBreadcrumb
								moduleTitle={mod?.title ?? ""}
								current={currentIdx + 1}
								total={lessons.length}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold text-primary font-body">
								{lesson.title}
							</span>
						</div>
						<StepNav
							total={totalSteps}
							current={stepIndex}
							maxVisited={maxVisited}
							onSelect={(i) => {
								setStepIndex(i);
								assistant.clearAssistant();
							}}
						/>
					</div>

					<div className="bg-bg-surface border border-bg-elevated rounded-2xl p-6 min-h-48 overflow-hidden">
						<AssistantContentToggle
							showingAssistant={assistant.showingAssistant}
							activeContent={assistant.activeContent}
							activeAction={assistant.activeAction}
							onShowOriginal={assistant.showOriginal}
							onShowAssistant={assistant.showAssistantView}>
							{currentStep && (
								<motion.div
									key={`step-${stepIndex}`}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.15 }}>
									<StepView step={currentStep} />
								</motion.div>
							)}
						</AssistantContentToggle>
					</div>

					<LessonNavBar
						onPrev={handlePrevStep}
						onNext={handleNextStep}
						prevDisabled={stepIndex === 0}
						isLast={stepIndex >= totalSteps - 1}
						center={
							<FakeAssistantButton
								hasContent={assistant.hasContent}
								showingAssistant={assistant.showingAssistant}
								onClick={assistant.openModal}
							/>
						}
					/>
				</div>
			</div>

			<FakeAssistantModal
				open={assistant.modalOpen}
				onClose={assistant.closeModal}
				onRequest={assistant.request}
			/>
		</div>
	);
}
