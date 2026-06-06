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
import { triggerConfetti } from "@/utils/confetti";
import { playSound } from "@/utils/sounds";
import { lessonPath } from "@/utils/lesson-path";
import type { QuizLesson, QuizQuestion } from "@/content/curriculum.types";

function starsFromScore(correct: number, total: number): number {
	const ratio = total === 0 ? 1 : correct / total;
	return Math.max(1, Math.round(ratio * 5));
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
	const [selected, setSelected] = useState<number | null>(null);
	const revealed = selected !== null;
	const isCorrect = selected === question.correctIndex;

	function handleSelect(idx: number) {
		if (revealed) return;
		setSelected(idx);
		onAnswer(idx);
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
					<span className="text-xs text-[#8888AA] font-body">
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
				<p className="font-body text-[#E8E8F0] text-base leading-relaxed whitespace-pre-wrap">
					{question.question}
				</p>
			</div>

			<div className="space-y-2.5">
				{question.options.map((option, idx) => {
					let borderClass =
						"border-bg-elevated hover:border-primary/40";
					let bgClass = "bg-bg-surface hover:bg-bg-elevated";
					let textClass = "text-[#E8E8F0]";

					if (revealed) {
						if (idx === question.correctIndex) {
							borderClass = "border-primary/60";
							bgClass = "bg-primary/10";
							textClass = "text-primary";
						} else if (idx === selected && !isCorrect) {
							borderClass = "border-accent/60";
							bgClass = "bg-accent/10";
							textClass = "text-accent";
						} else {
							borderClass = "border-bg-elevated/50";
							bgClass = "bg-bg-surface/50";
							textClass = "text-[#8888AA]";
						}
					}

					return (
						<motion.button
							key={idx}
							whileHover={!revealed ? { scale: 1.01 } : {}}
							whileTap={!revealed ? { scale: 0.99 } : {}}
							onClick={() => handleSelect(idx)}
							disabled={revealed}
							className={`
                w-full text-left px-4 py-3 rounded-xl border transition-all
                ${bgClass} ${borderClass} ${textClass}
                font-body text-sm
                ${!revealed ? "cursor-pointer" : "cursor-default"}
              `}>
							<span className="font-semibold mr-2 opacity-60">
								{String.fromCharCode(65 + idx)}.
							</span>
							{option}
						</motion.button>
					);
				})}
			</div>

			<AnimatePresence>
				{revealed && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						className={`rounded-xl p-4 border ${
							isCorrect
								? "bg-primary/10 border-primary/30"
								: "bg-accent/10 border-accent/30"
						}`}>
						<p className="font-body text-sm font-semibold mb-1">
							{isCorrect ? "✅ Correto!" : "❌ Quase lá!"}
						</p>
						<p className="font-body text-sm text-[#E8E8F0] leading-relaxed">
							{question.explanation}
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

interface QuizResultProps {
	quiz: QuizLesson;
	correct: number;
	stars: number;
	onNext: () => void;
	onMap: () => void;
}

function QuizResult({ quiz, correct, stars, onNext, onMap }: QuizResultProps) {
	const total = quiz.questions.length;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ type: "spring", stiffness: 280, damping: 22 }}
			className="text-center space-y-6">
			<div className="text-6xl">🎉</div>

			<div>
				<h2 className="font-heading font-bold text-2xl text-primary mb-1">
					Quiz Concluído!
				</h2>
				<p className="text-[#8888AA] font-body text-sm">{quiz.title}</p>
			</div>

			<div className="flex justify-center gap-2">
				{[1, 2, 3, 4, 5].map((s) => (
					<motion.span
						key={s}
						initial={{ scale: 0, rotate: -20 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{
							delay: s * 0.1,
							type: "spring",
							stiffness: 400,
						}}
						className="text-3xl">
						{s <= stars ? "⭐" : "☆"}
					</motion.span>
				))}
			</div>

			<div className="bg-bg-surface border border-bg-elevated rounded-2xl p-5 space-y-2">
				<p className="text-[#8888AA] font-body text-sm">
					Acertou{" "}
					<span className="text-[#E8E8F0] font-semibold">
						{correct}
					</span>{" "}
					de{" "}
					<span className="text-[#E8E8F0] font-semibold">
						{total}
					</span>{" "}
					perguntas
				</p>
				<div className="inline-block bg-secondary/20 border border-secondary/30 rounded-xl px-5 py-2">
					<span className="font-heading font-bold text-secondary text-xl">
						+{quiz.xpReward} XP
					</span>
				</div>
			</div>

			<div className="flex gap-3">
				<Button
					variant="ghost"
					size="md"
					className="flex-1"
					onClick={onMap}>
					Jornada
				</Button>
				<Button
					variant="primary"
					size="md"
					className="flex-1"
					onClick={onNext}>
					Próximo
				</Button>
			</div>
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
				if (isFirstCompletion) addXP(quiz.xpReward);
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

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (error || !quiz) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-[#8888AA] font-body">
					{error ?? "Quiz não encontrado."}
				</p>
			</div>
		);
	}

	const correctCount = answeredCorrect.filter(Boolean).length;
	const stars = starsFromScore(correctCount, quiz.questions.length);

	const lessons = mod?.lessons ?? [];
	const lessonIndex = lessons.findIndex((l) => l.id === lessonId);

	return (
		<div className="max-w-2xl mx-auto px-4 py-8 min-w-0">
			{!showingResult && (
				<div className="flex items-center justify-between mb-4">
					<span className="text-xs text-[#8888AA] font-body truncate">
						{mod?.title} — Lição {lessonIndex + 1} de{" "}
						{lessons.length}
					</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate("/")}>
						✕ Sair
					</Button>
				</div>
			)}
			<AnimatePresence mode="wait">
				{showingResult ? (
					<QuizResult
						key="result"
						quiz={quiz}
						correct={correctCount}
						stars={stars}
						onNext={handleNext}
						onMap={() => navigate("/")}
					/>
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
										? "Próxima Pergunta →"
										: "Ver Resultado →"}
								</Button>
							</motion.div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
