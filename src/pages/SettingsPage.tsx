import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settings.store";
import type { AppTheme, EditorTheme } from "@/store/settings.store";
import { useProgressStore } from "@/store/progress.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { EDITOR_THEME_LABELS } from "@/engine/monaco-theme";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ToggleRowProps {
	label: string;
	description: string;
	checked: boolean;
	onChange: () => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
	return (
		<div className="flex items-center justify-between py-4 border-b border-bg-elevated last:border-0">
			<div>
				<p className="font-body font-semibold text-text-main text-sm">
					{label}
				</p>
				<p className="text-xs text-text-muted font-body mt-0.5">
					{description}
				</p>
			</div>
			<motion.button
				whileTap={{ scale: 0.9 }}
				onClick={onChange}
				className={`
          w-12 h-6 rounded-full transition-colors relative flex-shrink-0
          ${checked ? "bg-primary" : "bg-bg-elevated"}
        `}>
				<motion.div
					animate={{ x: checked ? 24 : 2 }}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
					className="w-5 h-5 bg-white rounded-full absolute top-0.5"
				/>
			</motion.button>
		</div>
	);
}

interface SelectRowProps<T extends string> {
	label: string;
	description: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (v: T) => void;
}

function SelectRow<T extends string>({ label, description, value, options, onChange }: SelectRowProps<T>) {
	return (
		<div className="flex items-center justify-between py-4 border-b border-bg-elevated last:border-0">
			<div>
				<p className="font-body font-semibold text-text-main text-sm">
					{label}
				</p>
				<p className="text-xs text-text-muted font-body mt-0.5">
					{description}
				</p>
			</div>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value as T)}
				className="bg-bg-elevated text-text-main font-body text-sm rounded-lg px-3 py-1.5 border border-bg-elevated outline-none focus:border-primary/50 transition-colors cursor-pointer"
			>
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</div>
	);
}

const APP_THEME_OPTIONS: { value: AppTheme; label: string }[] = [
	{ value: "dark", label: "Escuro" },
	{ value: "light", label: "Claro" },
];

const EDITOR_THEME_OPTIONS: { value: EditorTheme; label: string }[] = (
	Object.entries(EDITOR_THEME_LABELS) as [EditorTheme, string][]
).map(([value, label]) => ({ value, label }));

export function SettingsPage() {
	const navigate = useNavigate();
	const {
		soundEnabled,
		debugMode,
		appTheme,
		editorTheme,
		toggleSound,
		toggleDebugMode,
		resetOnboarding,
		setAppTheme,
		setEditorTheme,
	} = useSettingsStore();

	const { resetProgress, profile, xp, completedExercises, achievements } = useProgressStore();
	const resetOnboardingStore = useOnboardingStore((s) => s.reset);
	const [resetModalOpen, setResetModalOpen] = useState(false);
	const [resetConfirmText, setResetConfirmText] = useState("");
	const [debugVisible, setDebugVisible] = useState(debugMode);
	const tapCount = useRef(0);
	const tapTimer = useRef<ReturnType<typeof setTimeout>>();

	function handleTitleTap() {
		if (tapCount.current === 0) {
			tapTimer.current = setTimeout(() => {
				tapCount.current = 0;
			}, 1000);
		}
		tapCount.current += 1;
		if (tapCount.current >= 7) {
			clearTimeout(tapTimer.current);
			tapCount.current = 0;
			setDebugVisible(true);
		}
	}

	function handleReset() {
		if (resetConfirmText !== "APAGAR") return;
		resetProgress();
		resetOnboarding();
		resetOnboardingStore();
		setResetModalOpen(false);
		setResetConfirmText("");
		navigate("/");
	}

	function openResetModal() {
		setResetConfirmText("");
		setResetModalOpen(true);
	}

	return (
		<div className="max-w-lg mx-auto px-4 py-8 space-y-6">
			<h1
				className="font-heading text-2xl font-bold text-text-main select-none cursor-default"
				onClick={handleTitleTap}>
				Configurações
			</h1>

			<div className="bg-bg-surface border border-bg-elevated rounded-2xl px-5">
				<ToggleRow
					label="Sons"
					description="Efeitos sonoros de feedback ao acertar e errar"
					checked={soundEnabled}
					onChange={toggleSound}
				/>
				<SelectRow
					label="Aparência"
					description="Tema visual do aplicativo"
					value={appTheme}
					options={APP_THEME_OPTIONS}
					onChange={setAppTheme}
				/>
				<SelectRow
					label="Tema do Editor"
					description="Cores do editor de código"
					value={editorTheme}
					options={EDITOR_THEME_OPTIONS}
					onChange={setEditorTheme}
				/>
			</div>

			{debugVisible && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					className="bg-bg-surface border border-secondary/30 rounded-2xl px-5 overflow-hidden">
					<ToggleRow
						label="Modo Debug"
						description="Desbloqueia todos os módulos e lições para teste"
						checked={debugMode}
						onChange={() => {
						toggleDebugMode();
						if (debugMode) setDebugVisible(false);
					}}
					/>
				</motion.div>
			)}

			<div className="bg-bg-surface border border-bg-elevated rounded-2xl p-5">
				<h2 className="font-heading font-semibold text-text-main mb-2">
					Conta
				</h2>
				<p className="text-xs text-text-muted font-body mb-4">
					Jogando como{" "}
					<strong className="text-text-main">{profile.name}</strong>
				</p>
				<Button
					variant="danger"
					size="sm"
					onClick={openResetModal}>
					Resetar Progresso
				</Button>
			</div>

			<Modal
				open={resetModalOpen}
				onClose={() => setResetModalOpen(false)}
				title="Resetar Progresso">
				<p className="text-text-muted font-body text-sm mb-4">
					Isso vai apagar{" "}
					<strong className="text-accent">todo</strong> o seu
					progresso. Essa ação não pode ser desfeita.
				</p>
				<div className="flex flex-wrap gap-3 mb-4 text-xs font-body">
					<span className="bg-bg-elevated rounded-lg px-3 py-1.5 text-text-main">
						{xp} XP
					</span>
					<span className="bg-bg-elevated rounded-lg px-3 py-1.5 text-text-main">
						{Object.keys(completedExercises).length} lições
					</span>
					<span className="bg-bg-elevated rounded-lg px-3 py-1.5 text-text-main">
						{Object.values(completedExercises).reduce((s, e) => s + e.stars, 0)} estrelas
					</span>
					<span className="bg-bg-elevated rounded-lg px-3 py-1.5 text-text-main">
						{achievements.length} troféus
					</span>
				</div>
				<div className="mb-5">
					<label className="block text-xs text-text-muted font-body mb-1.5">
						Digite <strong className="text-accent">APAGAR</strong> para confirmar
					</label>
					<input
						value={resetConfirmText}
						onChange={(e) => setResetConfirmText(e.target.value)}
						placeholder="APAGAR"
						className="w-full bg-bg-primary border border-bg-elevated rounded-xl px-4 py-2.5 text-text-main font-mono text-sm outline-none focus:border-accent/50 transition-colors"
					/>
				</div>
				<div className="flex gap-3">
					<Button
						variant="ghost"
						size="md"
						className="flex-1"
						onClick={() => setResetModalOpen(false)}>
						Cancelar
					</Button>
					<Button
						variant="accent"
						size="md"
						className="flex-1"
						disabled={resetConfirmText !== "APAGAR"}
						onClick={handleReset}>
						Resetar
					</Button>
				</div>
			</Modal>
		</div>
	);
}
