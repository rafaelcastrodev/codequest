import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLesson } from "@/hooks/useLesson";
import { useProgressStore } from "@/store/progress.store";
import { useSessionStore } from "@/store/session.store";
import { useAchievements } from "@/hooks/useAchievements";
import { useSettingsStore } from "@/store/settings.store";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RichText } from "@/components/ui/RichText";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LessonBreadcrumb } from "@/components/lesson/LessonBreadcrumb";
import { CompletionCard } from "@/components/lesson/CompletionCard";
import { ChoiceList } from "@/components/lesson/ChoiceList";
import { ConfirmButton } from "@/components/lesson/ConfirmButton";
import { RevealFeedback } from "@/components/lesson/RevealFeedback";
import { useRevealableChoice } from "@/hooks/useRevealableChoice";
import { icons } from "@/components/ui/Icon";
import { triggerConfetti } from "@/utils/confetti";
import { playSound } from "@/utils/sounds";
import { lessonPath } from "@/utils/lesson-path";
import type { QuizLesson, QuizQuestion } from "@/content/curriculum.types";

function starsFromScore(correct: number, total: number): number {
	const ratio = total === 0 ? 1 : correct / total;
	if (ratio >= 1) return 3;
	if (ratio >= 0.7) return 2;
	return 1;
}

interface QuestionCardProps {
	question: QuizQuestion;
	questionNumber: number;
	totalQuestions: number;
	onAnswer: (index: number) => void;
}

function QuestionCard({
	question,
	questionNumber,
	totalQuestions,
	onAnswer,
}: QuestionCardProps) {
	const { selected, revealed, isCorrect, handleSelect, handleConfirm } =
		useRevealableChoice(question.correctIndex);

	function handleConfirmAndNotify() {
		if (selected === null || revealed) return;
		handleConfirm();
		onAnswer(selected);
	}

	return (
		<motion.div
			key={question.id}
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -30 }}
			transition={{ duration: 0.25 }}
			className="space-y-5">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-xs text-text-muted font-body">
						Pergunta {questionNumber} de {totalQuestions}
					</span>
				</div>
				<ProgressBar
					value={questionNumber}
					max={totalQuestions}
					variant="secondary"
					size="sm"
				/>
			</div>

			<div className="bg-bg-surface border border-bg-elevated rounded-2xl p-6">
				<RichText
					content={question.question}
					className="font-body text-text-main text-base leading-relaxed"
				/>
			</div>

			<ChoiceList
				options={question.options}
				selected={selected}
				correctIndex={question.correctIndex}
				revealed={revealed}
				onSelect={handleSelect}
				fontClass="font-body text-sm"
				renderLabel={(option, idx) => (
					<>
						<span className="font-semibold mr-2 opacity-60">
							{String.fromCharCode(65 + idx)}.
						</span>
						<RichText content={option} className="inline" />
					</>
				)}
			/>

			<ConfirmButton
				visible={!revealed && selected !== null}
				onClick={handleConfirmAndNotify}
				size="md"
				className="px-12"
			/>

			<RevealFeedback
				revealed={revealed}
				isCorrect={isCorrect}
				explanation={question.explanation}
				successLabel="Correto!"
				failLabel="Quase lá!"
			/>
		</motion.div>
	);
}

export function QuizPage() {
	const { moduleId, lessonId } = useParams<{
		moduleId: string;
		lessonId: string;
	}>();
	const navigate = useNavigate();

	const {
		module: mod,
		lesson,
		loading,
		error,
	} = useLesson(moduleId, lessonId);
	const { addXP, completeExercise, updateStreak, completedExercises } =
		useProgressStore();
	const { setCurrentLesson } = useSessionStore();
	const { checkAndUnlock } = useAchievements();
	const { soundEnabled } = useSettingsStore();

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answeredCorrect, setAnsweredCorrect] = useState<boolean[]>([]);
	const [showingResult, setShowingResult] = useState(false);
	const [canAdvance, setCanAdvance] = useState(false);
	const [xpGained, setXpGained] = useState(0);
	const xpAwarded = useRef(false);
	const pendingAchievementCheck = useRef(false);

	const quiz = lesson?.type === "quiz" ? (lesson as QuizLesson) : null;

	useEffect(() => {
		if (moduleId && lessonId) setCurrentLesson(moduleId, lessonId);
	}, [moduleId, lessonId, setCurrentLesson]);

	useEffect(() => {
		if (pendingAchievementCheck.current) {
			pendingAchievementCheck.current = false;
			checkAndUnlock();
		}
	}, [completedExercises, checkAndUnlock]);

	function handleAnswer(selectedIndex: number) {
		if (!quiz) return;
		const currentQuestion = quiz.questions[currentQuestionIndex];
		if (!currentQuestion) return;
		const isCorrect = selectedIndex === currentQuestion.correctIndex;
		setAnsweredCorrect((prev) => [...prev, isCorrect]);
		setCanAdvance(true);
		if (soundEnabled) playSound(isCorrect ? "success" : "error");
	}

	function handleAdvance() {
		if (!quiz) return;
		const nextIdx = currentQuestionIndex + 1;

		if (nextIdx >= quiz.questions.length) {
			if (!xpAwarded.current) {
				const correct = answeredCorrect.filter(Boolean).length;
				const stars = starsFromScore(correct, quiz.questions.length);
				const isFirstCompletion = !completedExercises[quiz.id];
				const earned = isFirstCompletion ? quiz.xpReward : Math.round(quiz.xpReward * 0.1);
				addXP(earned);
				setXpGained(earned);
				completeExercise(quiz.id, stars, 0);
				updateStreak();
				xpAwarded.current = true;
				triggerConfetti();
				if (soundEnabled) playSound("success");
				pendingAchievementCheck.current = true;
			}
			setShowingResult(true);
		} else {
			setCurrentQuestionIndex(nextIdx);
			setCanAdvance(false);
		}
	}

	function handleNext() {
		if (!mod || !moduleId) return navigate("/");
		const lessons = mod.lessons;
		const idx = lessons.findIndex((l) => l.id === lessonId);
		const next = lessons[idx + 1];
		if (!next) return navigate("/");
		navigate(lessonPath(moduleId, next));
	}

	if (loading) return <LoadingSpinner />;

	if (error || !quiz) {
		return <EmptyState message={error ?? "Quiz não encontrado."} />;
	}

	const correctCount = answeredCorrect.filter(Boolean).length;
	const stars = starsFromScore(correctCount, quiz.questions.length);

	const lessons = mod?.lessons ?? [];
	const lessonIndex = lessons.findIndex((l) => l.id === lessonId);

	return (
		<div className="w-full max-w-2xl mx-auto px-4 py-8 min-w-0">
			{!showingResult && (
				<div className="space-y-2 mb-4">
					<LessonBreadcrumb
						moduleTitle={mod?.title ?? ""}
						current={lessonIndex + 1}
						total={lessons.length}
					/>
				</div>
			)}
			<AnimatePresence mode="wait">
				{showingResult ? (
					<motion.div
						key="result"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
					>
						<CompletionCard
							icon={<icons.party />}
							context="quiz"
							title="Quiz Concluído!"
							subtitle={quiz.title}
							stars={stars}
							xpReward={xpGained}
							onNext={handleNext}
							onMap={() => navigate("/")}
							nextLabel="Próximo">
							<div className="bg-bg-elevated/60 rounded-xl p-4">
								<p className="text-text-muted font-body text-sm">
									Acertou{" "}
									<span className="text-text-main font-semibold">
										{correctCount}
									</span>{" "}
									de{" "}
									<span className="text-text-main font-semibold">
										{quiz.questions.length}
									</span>{" "}
									perguntas
								</p>
							</div>
						</CompletionCard>
					</motion.div>
				) : (
					<motion.div
						key={`q-${currentQuestionIndex}`}
						className="space-y-6">
						<QuestionCard
							question={
								quiz.questions[currentQuestionIndex] ??
								quiz.questions[0]!
							}
							questionNumber={currentQuestionIndex + 1}
							totalQuestions={quiz.questions.length}
							onAnswer={handleAnswer}
						/>

						{canAdvance && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex justify-end">
								<Button
									variant="primary"
									size="md"
									onClick={handleAdvance}>
									{currentQuestionIndex <
									quiz.questions.length - 1
										? <>Próxima Pergunta <icons.arrowRight /></>
										: <>Ver Resultado <icons.arrowRight /></>}
								</Button>
							</motion.div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
