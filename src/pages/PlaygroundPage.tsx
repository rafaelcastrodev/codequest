import {
	lazy,
	Suspense,
	useState,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaygroundRunner } from "@/hooks/usePlaygroundRunner";
import {
	usePlaygroundStore,
	PLAYGROUND_TEMPLATES,
	type PlaygroundSnippet,
	type PlaygroundTemplate,
} from "@/store/playground.store";
import { Button } from "@/components/ui/Button";
import { OutputPanel } from "@/components/exercise/OutputPanel";
import { Modal } from "@/components/ui/Modal";
import { icons } from "@/components/ui/Icon";
import { useClipboard } from "@/hooks/useClipboard";
import { SymbolToolbar } from "@/components/exercise/SymbolToolbar";
import { defineAllThemes } from "@/engine/monaco-theme";
import { useSettingsStore } from "@/store/settings.store";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { NavigationGuardModal } from "@/components/ui/NavigationGuardModal";
import type { OnMount } from "@monaco-editor/react";
import type { ReactNode } from "react";

const MonacoEditor = lazy(() =>
	import("@monaco-editor/react").then((m) => ({ default: m.Editor })),
);

const DEFAULT_CODE = `// Escreva seu código TypeScript aqui e clique em Executar

console.log("Olá, mundo!");
`;

function formatDate(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

interface SnippetListModalProps {
	open: boolean;
	onClose: () => void;
	snippets: PlaygroundSnippet[];
	currentId: string | null;
	onLoad: (snippet: PlaygroundSnippet) => void;
	onDelete: (id: string) => void;
	onRename: (id: string, name: string) => void;
}

function SnippetListModal({
	open,
	onClose,
	snippets,
	currentId,
	onLoad,
	onDelete,
	onRename,
}: SnippetListModalProps) {
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const renameRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (renamingId && renameRef.current) renameRef.current.focus();
	}, [renamingId]);

	const startRename = (snippet: PlaygroundSnippet) => {
		setRenamingId(snippet.id);
		setRenameValue(snippet.name);
	};

	const confirmRename = () => {
		if (renamingId && renameValue.trim()) {
			onRename(renamingId, renameValue.trim());
		}
		setRenamingId(null);
	};

	return (
		<Modal open={open} onClose={onClose} title="Meus Projetos">
			{snippets.length === 0 ? (
				<div className="text-center py-8">
					<icons.folder className="text-4xl mb-3" />
					<p className="text-text-muted font-body text-sm">
						Nenhum projeto salvo ainda.
					</p>
					<p className="text-text-muted font-body text-xs mt-1">
						Use o botao Salvar para guardar seu codigo.
					</p>
				</div>
			) : (
				<div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
					{snippets.map((snippet) => (
						<div
							key={snippet.id}
							className={`
                group flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer
                ${
					snippet.id === currentId
						? "border-primary/40 bg-primary/10"
						: "border-bg-elevated hover:border-primary/20 hover:bg-bg-elevated"
				}
              `}
							onClick={() => {
								onLoad(snippet);
								onClose();
							}}>
							<div className="flex-1 min-w-0">
								{renamingId === snippet.id ? (
									<input
										ref={renameRef}
										value={renameValue}
										onChange={(e) =>
											setRenameValue(e.target.value)
										}
										onBlur={confirmRename}
										onKeyDown={(e) => {
											if (e.key === "Enter")
												confirmRename();
											if (e.key === "Escape")
												setRenamingId(null);
										}}
										onClick={(e) => e.stopPropagation()}
										className="w-full bg-bg-primary border border-primary/40 rounded-lg px-2 py-1 text-sm text-text-main font-body outline-none"
									/>
								) : (
									<>
										<p className="font-body font-semibold text-sm text-text-main truncate">
											{snippet.name}
										</p>
										<p className="font-body text-xs text-text-muted">
											{formatDate(snippet.updatedAt)}
										</p>
									</>
								)}
							</div>
							<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={(e) => {
										e.stopPropagation();
										startRename(snippet);
									}}
									className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-main hover:bg-bg-primary transition-colors text-xs"
									title="Renomear">
									<icons.pencil />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										onDelete(snippet.id);
									}}
									className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors text-xs"
									title="Excluir">
									<icons.trash />
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</Modal>
	);
}

interface SaveModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (name: string) => void;
}

function SaveModal({ open, onClose, onSave }: SaveModalProps) {
	const [name, setName] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (open) {
			setName("");
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [open]);

	const handleSubmit = () => {
		onSave(name.trim() || "Sem titulo");
		onClose();
	};

	return (
		<Modal open={open} onClose={onClose} title="Salvar Projeto">
			<div className="space-y-4">
				<div>
					<label className="block font-body text-sm text-text-muted mb-1.5">
						Nome do projeto
					</label>
					<input
						ref={inputRef}
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSubmit();
						}}
						placeholder="Meu programa"
						className="w-full bg-bg-primary border border-bg-elevated rounded-xl px-4 py-2.5 text-text-main font-body text-sm outline-none focus:border-primary/50 transition-colors"
					/>
				</div>
				<div className="flex justify-end gap-2">
					<Button variant="ghost" size="sm" onClick={onClose}>
						Cancelar
					</Button>
					<Button variant="primary" size="sm" onClick={handleSubmit}>
						Salvar
					</Button>
				</div>
			</div>
		</Modal>
	);
}

interface TemplateModalProps {
	open: boolean;
	onClose: () => void;
	templates: PlaygroundTemplate[];
	onSelect: (template: PlaygroundTemplate) => void;
}

function TemplateModal({
	open,
	onClose,
	templates,
	onSelect,
}: TemplateModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="Modelos">
			<p className="text-text-muted font-body text-xs mb-4">
				Escolha um modelo como ponto de partida para experimentar.
			</p>
			<div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
				{templates.map((t) => (
					<button
						key={t.id}
						onClick={() => {
							onSelect(t);
							onClose();
						}}
						className="w-full flex items-center gap-3 p-3 rounded-xl border border-bg-elevated hover:border-secondary/30 hover:bg-bg-elevated transition-colors text-left">
						<span className="text-2xl flex-shrink-0">
							{icons[t.icon]({})}
						</span>
						<div className="min-w-0">
							<p className="font-body text-sm font-semibold text-text-main">
								{t.name}
							</p>
							<p className="font-body text-xs text-text-muted">
								{t.description}
							</p>
						</div>
					</button>
				))}
			</div>
		</Modal>
	);
}

interface ToolbarMenuItem {
	icon: ReactNode;
	label: string;
	onClick: () => void;
}

interface ToolbarMenuModalProps {
	open: boolean;
	onClose: () => void;
	items: ToolbarMenuItem[];
}

function ToolbarMenuModal({ open, onClose, items }: ToolbarMenuModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="Ações">
			<div className="space-y-2">
				{items.map((item) => (
					<button
						key={item.label}
						onClick={() => {
							item.onClick();
							onClose();
						}}
						className="w-full flex items-center gap-3 p-3 rounded-xl border border-bg-elevated hover:border-primary/30 hover:bg-bg-elevated transition-colors text-left">
						<span className="text-xl flex-shrink-0">
							{item.icon}
						</span>
						<span className="font-body text-sm font-semibold text-text-main">
							{item.label}
						</span>
					</button>
				))}
			</div>
		</Modal>
	);
}

export function PlaygroundPage() {
	const [code, setCode] = useState(DEFAULT_CODE);
	const [currentSnippetId, setCurrentSnippetId] = useState<string | null>(
		null,
	);
	const [showSnippets, setShowSnippets] = useState(false);
	const [showTemplates, setShowTemplates] = useState(false);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [showToolbarMenu, setShowToolbarMenu] = useState(false);
	const [savedFeedback, setSavedFeedback] = useState(false);
	const clipboard = useClipboard();
	const editorTheme = useSettingsStore((s) => s.editorTheme);

	const {
		snippets,
		saveSnippet,
		updateSnippetCode,
		renameSnippet,
		deleteSnippet,
	} = usePlaygroundStore();
	const runner = usePlaygroundRunner();

	const currentSnippet = currentSnippetId
		? snippets.find((s) => s.id === currentSnippetId)
		: null;

	const baselineCode = currentSnippet ? currentSnippet.code : DEFAULT_CODE;
	const isDirty = code !== baselineCode && code.trim() !== "";
	const navigationGuard = useNavigationGuard(isDirty);

	const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
	const handleRunRef = useRef<() => void>(() => {});
	const handleSaveRef = useRef<() => void>(() => {});

	const handleEditorMount: OnMount = useCallback((editor) => {
		editorRef.current = editor;
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

	const handleRun = useCallback(() => {
		if (runner.status === "running") return;
		runner.run(code);
	}, [code, runner]);

	const handleNew = useCallback(() => {
		setCode(DEFAULT_CODE);
		setCurrentSnippetId(null);
		runner.reset();
	}, [runner]);

	const showSavedFeedback = useCallback(() => {
		setSavedFeedback(true);
		setTimeout(() => setSavedFeedback(false), 1500);
	}, []);

	const handleSave = useCallback(() => {
		if (currentSnippetId) {
			updateSnippetCode(currentSnippetId, code);
			showSavedFeedback();
		} else {
			setShowSaveModal(true);
		}
	}, [currentSnippetId, code, updateSnippetCode, showSavedFeedback]);

	const handleSaveNew = useCallback(
		(name: string) => {
			const id = saveSnippet(name, code);
			setCurrentSnippetId(id);
			showSavedFeedback();
		},
		[code, saveSnippet, showSavedFeedback],
	);

	const handleLoad = useCallback(
		(snippet: PlaygroundSnippet) => {
			setCode(snippet.code);
			setCurrentSnippetId(snippet.id);
			runner.reset();
		},
		[runner],
	);

	const handleDelete = useCallback(
		(id: string) => {
			deleteSnippet(id);
			if (currentSnippetId === id) {
				setCurrentSnippetId(null);
				setCode(DEFAULT_CODE);
				runner.reset();
			}
		},
		[currentSnippetId, deleteSnippet, runner],
	);

	const handleTemplateSelect = useCallback(
		(template: PlaygroundTemplate) => {
			setCode(template.code);
			setCurrentSnippetId(null);
			runner.reset();
		},
		[runner],
	);

	handleRunRef.current = handleRun;
	handleSaveRef.current = handleSave;

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				handleRunRef.current();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				handleSaveRef.current();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="flex items-center justify-between px-4 py-2 border-b border-bg-elevated bg-bg-surface flex-shrink-0">
				<div className="flex items-center gap-3 min-w-0">
					<h1 className="font-heading font-bold text-text-main text-base whitespace-nowrap">
						<span className="hidden sm:inline">Playground</span>
						<span className="sm:hidden">Play</span>
					</h1>
					<AnimatePresence mode="wait">
						{currentSnippet ? (
							<motion.span
								key={currentSnippet.id}
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								className="font-mono text-xs text-primary truncate max-w-40">
								{currentSnippet.name}
							</motion.span>
						) : (
							""
						)}
					</AnimatePresence>
				</div>

				<div className="flex items-center gap-1.5 sm:gap-2">
					<button
						onClick={() => setShowToolbarMenu(true)}
						className="sm:hidden flex items-center gap-1.5 px-3 h-10 rounded-lg border border-bg-elevated text-text-main hover:bg-bg-elevated transition-colors"
						title="Menu">
						<icons.notepadtext className="text-xl" />
						<span className="text-sm font-body">Menu</span>
					</button>

					<div className="hidden sm:flex items-center gap-1.5">
						<button
							onClick={handleNew}
							title="Novo"
							className="flex items-center justify-center gap-1.5 rounded-lg border border-bg-elevated text-text-main hover:bg-bg-elevated hover:border-secondary transition-colors lg:px-3 lg:py-2 lg:h-auto w-10 h-10 lg:w-auto">
							<icons.document className="text-lg flex-shrink-0" />
							<span className="hidden lg:inline text-sm font-body">Novo</span>
						</button>
						{PLAYGROUND_TEMPLATES.length > 0 && (
							<button
								onClick={() => setShowTemplates(true)}
								title="Modelos"
								className="flex items-center justify-center gap-1.5 rounded-lg border border-bg-elevated text-text-main hover:bg-bg-elevated hover:border-secondary transition-colors lg:px-3 lg:py-2 lg:h-auto w-10 h-10 lg:w-auto">
								<icons.files className="text-lg flex-shrink-0" />
								<span className="hidden lg:inline text-sm font-body">Modelos</span>
							</button>
						)}
						<button
							onClick={() => setShowSnippets(true)}
							title="Projetos"
							className="flex items-center justify-center gap-1.5 rounded-lg border border-bg-elevated text-text-main hover:bg-bg-elevated hover:border-secondary transition-colors lg:px-3 lg:py-2 lg:h-auto w-10 h-10 lg:w-auto">
							<icons.folderClosed className="text-lg flex-shrink-0" />
							<span className="hidden lg:inline text-sm font-body">
								Projetos{snippets.length > 0 ? ` (${snippets.length})` : ""}
							</span>
						</button>
						<button
							onClick={handleSave}
							title="Salvar"
							className="flex items-center justify-center gap-1.5 rounded-lg border border-bg-elevated text-text-main hover:bg-bg-elevated hover:border-secondary transition-colors lg:px-3 lg:py-2 lg:h-auto w-10 h-10 lg:w-auto">
							<AnimatePresence mode="wait">
								{savedFeedback ? (
									<motion.span
										key="saved"
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										className="text-primary flex items-center gap-1.5">
										<icons.copyCheck className="text-lg flex-shrink-0" />
										<span className="hidden lg:inline text-sm font-body">Salvo</span>
									</motion.span>
								) : (
									<motion.span
										key="save"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="flex items-center gap-1.5">
										<icons.save className="text-lg flex-shrink-0" />
										<span className="hidden lg:inline text-sm font-body">Salvar</span>
									</motion.span>
								)}
							</AnimatePresence>
						</button>
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
					</div>

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
				</div>
			</div>

			<SymbolToolbar onInsert={handleInsertSymbol} />

			<div className="flex-1 min-h-0">
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
			</div>

			<div className="p-3 bg-bg-primary border-t border-bg-elevated flex-shrink-0">
				{runner.status !== "idle" && (
					<div className="flex justify-end mb-1">
						<button
							onClick={runner.reset}
							className="text-xs text-text-muted hover:text-text-main font-body transition-colors">
							Limpar
						</button>
					</div>
				)}
				<OutputPanel
					output={runner.output}
					errorMessage={runner.errorMessage}
					mistakeMessage={null}
					status={runner.status}
				/>
			</div>

			<ToolbarMenuModal
				open={showToolbarMenu}
				onClose={() => setShowToolbarMenu(false)}
				items={[
					{
						icon: <icons.document />,
						label: "Novo",
						onClick: handleNew,
					},
					{
						icon: <icons.save />,
						label: "Salvar",
						onClick: handleSave,
					},
					{
						icon: <icons.folderClosed />,
						label: `Projetos${snippets.length > 0 ? ` (${snippets.length})` : ""}`,
						onClick: () => setShowSnippets(true),
					},
					{
						icon: clipboard.copied ? (
							<icons.copyCheck />
						) : (
							<icons.copy />
						),
						label: clipboard.copied ? "Copiado!" : "Copiar código",
						onClick: () => clipboard.copy(code),
					},
					...(PLAYGROUND_TEMPLATES.length > 0
						? [
								{
									icon: <icons.files />,
									label: "Modelos",
									onClick: () => setShowTemplates(true),
								},
							]
						: []),
				]}
			/>

			<SnippetListModal
				open={showSnippets}
				onClose={() => setShowSnippets(false)}
				snippets={snippets}
				currentId={currentSnippetId}
				onLoad={handleLoad}
				onDelete={handleDelete}
				onRename={renameSnippet}
			/>

			<SaveModal
				open={showSaveModal}
				onClose={() => setShowSaveModal(false)}
				onSave={handleSaveNew}
			/>

			<TemplateModal
				open={showTemplates}
				onClose={() => setShowTemplates(false)}
				templates={PLAYGROUND_TEMPLATES}
				onSelect={handleTemplateSelect}
			/>

			<NavigationGuardModal
				blocked={navigationGuard.blocked}
				onConfirm={navigationGuard.confirm}
				onCancel={navigationGuard.cancel}
			/>
		</div>
	);
}
