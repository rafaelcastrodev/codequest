import {
	lazy,
	Suspense,
	useState,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useExercise } from "@/hooks/useExercise";
import { useCodeRunner } from "@/hooks/useCodeRunner";
import { useProgressStore } from "@/store/progress.store";
import { useSessionStore } from "@/store/session.store";
import { useSettingsStore } from "@/store/settings.store";
import { useAchievements } from "@/hooks/useAchievements";
import { useAssistant } from "@/hooks/useAssistant";
import {
	FakeAssistantButton,
	FakeAssistantModal,
} from "@/components/lesson/FakeAssistant";
import { AssistantContentToggle } from "@/components/lesson/AssistantContentToggle";
import { LessonBreadcrumb } from "@/components/lesson/LessonBreadcrumb";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RichText } from "@/components/ui/RichText";
import { icons } from "@/components/ui/Icon";
import { useClipboard } from "@/hooks/useClipboard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { NavigationGuardModal } from "@/components/ui/NavigationGuardModal";
import { HintPanel } from "@/components/exercise/HintPanel";
import { OutputPanel } from "@/components/exercise/OutputPanel";
import { SuccessOverlay } from "@/components/exercise/SuccessOverlay";
import { SymbolToolbar } from "@/components/exercise/SymbolToolbar";
import { getLastCompileErrors, runWithInspection } from "@/engine/typescript-runner";
import type { VarSnapshot } from "@/engine/typescript-runner";
import { VariableInspector } from "@/components/lesson/VariableInspector";
import { defineAllThemes } from "@/engine/monaco-theme";
import type { OnMount } from "@monaco-editor/react";
import { triggerConfetti } from "@/utils/confetti";
import { playSound } from "@/utils/sounds";
import { lessonPath } from "@/utils/lesson-path";

const MonacoEditor = lazy(() =>
	import("@monaco-editor/react").then((m) => ({ default: m.Editor })),
);

export function ExercisePage() {
	const { moduleId, lessonId } = useParams<{
		moduleId: string;
		lessonId: string;
	}>();
	const navigate = useNavigate();

	const {
		module: mod,
		exercise,
		loading,
		error,
	} = useExercise(moduleId, lessonId);
	const runner = useCodeRunner();
	const { addXP, completeExercise, updateStreak, completedExercises } =
		useProgressStore();
	const soundEnabled = useSettingsStore((s) => s.soundEnabled);
	const debugMode = useSettingsStore((s) => s.debugMode);
	const editorTheme = useSettingsStore((s) => s.editorTheme);
	const { hintsUsed, useHint, setCurrentLesson } = useSessionStore();
	const { checkAndUnlock } = useAchievements();

	const assistant = useAssistant(moduleId, lessonId);
	const clipboard = useClipboard();

	const [code, setCode] = useState("");
	const [successStars, setSuccessStars] = useState<number | null>(null);
	const [xpGained, setXpGained] = useState(0);
	const [editorBorderStatus, setEditorBorderStatus] = useState<
		"idle" | "ok" | "err"
	>("idle");
	const [shakeKey, setShakeKey] = useState(0);
	const [mobileTab, setMobileTab] = useState<"instructions" | "code">(
		"instructions",
	);
	const [inspectionSnapshots, setInspectionSnapshots] = useState<VarSnapshot[]>([]);
	const pendingAchievementCheck = useRef<boolean>(false);
	const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();
	const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
	const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);

	const handleEditorMount: OnMount = useCallback((editor, monaco) => {
		editorRef.current = editor;
		monacoRef.current = monaco;
	}, []);

	const clearEditorMarkers = useCallback(() => {
		const editor = editorRef.current;
		const monaco = monacoRef.current;
		if (!editor || !monaco) return;
		const model = editor.getModel();
		if (model) monaco.editor.setModelMarkers(model, 'codequest', []);
	}, []);

	const showEditorErrors = useCallback(() => {
		const editor = editorRef.current;
		const monaco = monacoRef.current;
		if (!editor || !monaco) return;
		const model = editor.getModel();
		if (!model) return;
		const errors = getLastCompileErrors();
		if (errors.length === 0) return;
		monaco.editor.setModelMarkers(model, 'codequest', errors.map((e) => ({
			severity: monaco.MarkerSeverity.Error,
			message: e.message,
			startLineNumber: e.line,
			startColumn: e.column,
			endLineNumber: e.endLine,
			endColumn: e.endColumn,
		})));
	}, []);

	const handleInsertSymbol = useCallback((symbol: string) => {
		const editor = editorRef.current;
		if (!editor) return;
		editor.focus();
		const selection = editor.getSelection();
		if (selection) {
			editor.executeEdits('symbol-toolbar', [{
				range: selection,
				text: symbol,
				forceMoveMarkers: true,
			}]);
		}
	}, []);

	const resetRunner = runner.reset;

	const buildStarterCode = useCallback(
		(starterCode: string, instructions: string) => {
			if (window.innerWidth >= 1024) return starterCode;
			const lines = instructions
				.split("\n")
				.map((l) => ` * ${l}`)
				.join("\n");
			return `/* Enunciado:\n${lines}\n */\n\n${starterCode}`;
		},
		[],
	);

	const currentStarterCode = exercise
		? buildStarterCode(exercise.starterCode, exercise.instructions)
		: "";
	const isDirty = successStars === null && code !== currentStarterCode && code.trim() !== "";
	const navigationGuard = useNavigationGuard(isDirty);

	useEffect(() => {
		if (exercise) {
			const savedCode = sessionStorage.getItem(`codequest-autosave-${exercise.id}`);
			const starterCode = buildStarterCode(exercise.starterCode, exercise.instructions);
			setCode(savedCode && savedCode !== starterCode ? savedCode : starterCode);
			setSuccessStars(null);
			setEditorBorderStatus("idle");
			resetRunner();
			if (moduleId && lessonId) setCurrentLesson(moduleId, lessonId);
		}
	}, [
		exercise,
		moduleId,
		lessonId,
		setCurrentLesson,
		resetRunner,
		buildStarterCode,
	]);

	useEffect(() => {
		if (!exercise) return;
		clearTimeout(autoSaveTimer.current);
		autoSaveTimer.current = setTimeout(() => {
			sessionStorage.setItem(`codequest-autosave-${exercise.id}`, code);
		}, 2000);
		return () => clearTimeout(autoSaveTimer.current);
	}, [code, exercise]);

	useEffect(() => {
		if (pendingAchievementCheck.current) {
			pendingAchievementCheck.current = false;
			checkAndUnlock();
		}
	}, [completedExercises, checkAndUnlock]);

	const handleRun = useCallback(async () => {
		if (!exercise || runner.status === "running") return;
		clearEditorMarkers();

		if (exercise.inspectVars && exercise.inspectVars.length > 0) {
			runWithInspection(code, exercise.inspectVars)
				.then((result) => {
					setInspectionSnapshots(result.snapshots);
				})
				.catch(() => {});
		}

		const outcome = await runner.run(
			code,
			exercise.validation,
			exercise.commonMistakes,
			hintsUsed,
		);

		if (outcome.type === "passed") {
			setSuccessStars(outcome.stars);
			setEditorBorderStatus("ok");
			sessionStorage.removeItem(`codequest-autosave-${exercise.id}`);
			const isFirstCompletion = !completedExercises[exercise.id];
			const earned = isFirstCompletion ? exercise.xpReward : Math.round(exercise.xpReward * 0.1);
			addXP(earned);
			setXpGained(earned);
			completeExercise(exercise.id, outcome.stars, hintsUsed);
			updateStreak();
			triggerConfetti();
			if (soundEnabled) playSound("success");
			pendingAchievementCheck.current = true;
		} else if (outcome.type === "failed" || outcome.type === "error") {
			setEditorBorderStatus("err");
			setShakeKey((k) => k + 1);
			showEditorErrors();
			if (soundEnabled) playSound("error");
		}
	}, [
		exercise,
		runner,
		code,
		hintsUsed,
		addXP,
		completeExercise,
		completedExercises,
		updateStreak,
		clearEditorMarkers,
		showEditorErrors,
		soundEnabled,
	]);

	const handleNext = useCallback(() => {
		if (!mod || !moduleId) return navigate("/");
		const lessons = mod.lessons;
		const idx = lessons.findIndex((l) => l.id === lessonId);
		const next = lessons[idx + 1];
		if (!next) return navigate("/");
		navigate(lessonPath(moduleId, next));
	}, [mod, moduleId, lessonId, navigate]);

	const handleSkip = useCallback(() => {
		if (!exercise) return;
		completeExercise(exercise.id, 1, 0);
		handleNext();
	}, [exercise, completeExercise, handleNext]);

	if (loading) return <LoadingSpinner />;

	if (error || !exercise) {
		return <EmptyState message={error ?? "Exercício não encontrado."} />;
	}

	const lessons = mod?.lessons ?? [];
	const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
	const totalLessons = lessons.length;

	const editorBorderClass =
		editorBorderStatus === "ok"
			? "border-primary/50"
			: editorBorderStatus === "err"
				? "border-accent/50"
				: "border-transparent";

	const instructionsPanel = (
		<div className="flex-1 md:flex-initial md:w-96 xl:w-[28rem] flex-shrink-0 border-r border-bg-elevated bg-bg-surface flex flex-col overflow-hidden">
			<div className="px-5 pt-3 pb-2 border-b border-bg-elevated/50">
				<div className="flex items-center justify-between">
					<LessonBreadcrumb
						moduleTitle={mod?.title ?? ""}
						current={lessonIndex + 1}
						total={totalLessons}
					/>
				</div>
			</div>
			<div className="p-5 border-b border-bg-elevated">
				<div className="flex items-center gap-2 mb-2 flex-wrap">
					<Badge
						variant={
							exercise.type === "challenge" ? "accent" : "primary"
						}
						size="sm">
						{exercise.type === "challenge" ? (
							<>
								<icons.trophy /> Desafio
							</>
						) : (
							<>
								<icons.laptop /> Exercício
							</>
						)}
					</Badge>
					<Badge variant="secondary" size="sm">
						+{exercise.xpReward} XP
					</Badge>
					<Badge variant="muted" size="sm" className="py-1">
						{Array.from({ length: exercise.difficulty }, (_, i) => (
							<icons.star key={i} />
						))}
					</Badge>
				</div>
				<h1 className="font-heading font-bold text-text-main text-lg leading-snug">
					{exercise.title}
				</h1>
			</div>

			<div className="flex-1 p-5 overflow-y-auto scrollbar-thin space-y-4">
				<AssistantContentToggle
					showingAssistant={assistant.showingAssistant}
					activeContent={assistant.activeContent}
					activeAction={assistant.activeAction}
					onShowOriginal={assistant.showOriginal}
					onShowAssistant={assistant.showAssistantView}
					assistantClassName="font-body text-sm text-text-main leading-relaxed"
					assistantWrapper="elevated">
					<div className="bg-bg-elevated rounded-xl p-4">
						<RichText
							content={exercise.instructions}
							className="font-body text-sm text-text-main leading-relaxed"
						/>
					</div>
				</AssistantContentToggle>

				{exercise.hints.length > 0 && (
					<HintPanel
						hints={exercise.hints}
						hintsUsed={hintsUsed}
						onUseHint={useHint}
					/>
				)}
				<div className="py-3 flex items-center gap-2">
					<FakeAssistantButton
						hasContent={assistant.hasContent}
						showingAssistant={assistant.showingAssistant}
						onClick={assistant.openModal}
					/>
					<Button
						variant="primary"
						size="md"
						className="flex-1 md:hidden"
						onClick={() => setMobileTab("code")}>
						Abrir Editor <icons.arrowRight />
					</Button>
				</div>
			</div>
		</div>
	);

	const editorPanel = (
		<div className="flex-1 flex flex-col overflow-hidden relative">
			{successStars !== null && (
				<SuccessOverlay
					lesson={exercise}
					stars={successStars}
					hintsUsed={hintsUsed}
					xpGained={xpGained}
					onNext={handleNext}
					onMap={() => navigate("/")}
				/>
			)}

			<div className="flex items-center justify-between px-4 py-2 border-b border-bg-elevated bg-bg-surface flex-shrink-0">
				<div className="flex items-center gap-1.5">
					<button
						aria-label="Ver instruções"
						onClick={() => setMobileTab("instructions")}
						className="md:hidden flex items-center gap-1.5 px-3 h-10 rounded-lg border border-bg-elevated text-text-main hover:bg-bg-elevated transition-colors"
						title="Instruções">
						<icons.notepadtext className="text-xl" aria-hidden={true} />
						<span className="text-sm font-body">Instruções</span>
					</button>
				</div>
				<div className="flex items-center gap-1.5">
					<button
						onClick={() => clipboard.copy(code)}
						title="Copiar"
						className="flex items-center justify-center gap-1.5 rounded-lg border border-bg-elevated text-text-main hover:bg-bg-elevated hover:border-secondary transition-colors lg:px-3 lg:py-2 lg:h-auto w-10 h-10 lg:w-auto">
						{clipboard.copied ? (
							<>
								<icons.copyCheck className="text-lg flex-shrink-0" />
								<span className="hidden lg:inline text-sm font-body">Copiado!</span>
							</>
						) : (
							<>
								<icons.copy className="text-lg flex-shrink-0" />
								<span className="hidden lg:inline text-sm font-body">Copiar</span>
							</>
						)}
					</button>
					<button
						onClick={() => {
							setCode(
								buildStarterCode(
									exercise.starterCode,
									exercise.instructions,
								),
							);
							runner.reset();
							setEditorBorderStatus("idle");
						}}
						title="Resetar"
						className="flex items-center justify-center gap-1.5 rounded-lg border border-bg-elevated text-text-main hover:bg-bg-elevated hover:border-secondary transition-colors lg:px-3 lg:py-2 lg:h-auto w-10 h-10 lg:w-auto">
						<icons.refresh className="text-lg flex-shrink-0" />
						<span className="hidden lg:inline text-sm font-body">Resetar</span>
					</button>
					<Button
						variant="primary"
						size="sm"
						loading={runner.status === "running"}
						onClick={handleRun}
						className="min-w-28">
						{runner.status === "running" ? (
							"Executando..."
						) : (
							<>
								<icons.play /> Executar
							</>
						)}
					</Button>
					{debugMode && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleSkip}
							className="text-xs text-warning">
							Pular <icons.skipForward />
						</Button>
					)}
				</div>
			</div>

			<SymbolToolbar onInsert={handleInsertSymbol} />

			<motion.div
				key={shakeKey}
				animate={shakeKey > 0 ? { x: [-4, 4, -4, 4, 0] } : {}}
				transition={{ duration: 0.3 }}
				className={`flex-1 min-h-0 border-b transition-colors ${editorBorderClass}`}>
				<Suspense
					fallback={
						<div className="flex items-center justify-center h-full bg-bg-terminal">
							<div className="text-center space-y-2">
								<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
								<p className="text-xs text-text-muted font-mono">
									Carregando editor...
								</p>
							</div>
						</div>
					}>
					<MonacoEditor
						height="100%"
						language="typescript"
						value={code}
						onChange={(v) => setCode(v ?? "")}
						onMount={handleEditorMount}
						beforeMount={defineAllThemes}
						theme={editorTheme}
						options={{
							minimap: { enabled: false },
							fontSize: 14,
							lineNumbers: "on",
							scrollBeyondLastLine: false,
							automaticLayout: true,
							fontFamily: '"JetBrains Mono", monospace',
							fontLigatures: false,
							padding: { top: 16, bottom: 16 },
							tabSize: 2,
							wordWrap: "on",
							renderLineHighlight: "line",
							smoothScrolling: true,
							quickSuggestions: false,
							suggestOnTriggerCharacters: false,
							parameterHints: { enabled: false },
							wordBasedSuggestions: "off",
							tabCompletion: "off",
						}}
					/>
				</Suspense>
			</motion.div>

			<div className="p-3 bg-bg-primary border-t border-bg-elevated flex-shrink-0 space-y-2">
				<OutputPanel
					output={runner.output}
					errorMessage={runner.errorMessage}
					mistakeMessage={runner.mistakeMessage}
					status={runner.status}
				/>
				{exercise.inspectVars && inspectionSnapshots.length > 0 && (
					<VariableInspector
						snapshots={inspectionSnapshots}
						varNames={exercise.inspectVars}
					/>
				)}
			</div>
		</div>
	);

	return (
		<>
			<div className="flex flex-col md:flex-row h-full overflow-hidden">
				<div className="hidden md:flex md:flex-row flex-1 overflow-hidden">
					{instructionsPanel}
					{editorPanel}
				</div>
				<div className="flex flex-col flex-1 overflow-hidden md:hidden">
					{mobileTab === "instructions"
						? instructionsPanel
						: editorPanel}
				</div>
			</div>

			<FakeAssistantModal
				open={assistant.modalOpen}
				onClose={assistant.closeModal}
				onRequest={assistant.request}
			/>

			<NavigationGuardModal
				blocked={navigationGuard.blocked}
				onConfirm={navigationGuard.confirm}
				onCancel={navigationGuard.cancel}
			/>
		</>
	);
}
