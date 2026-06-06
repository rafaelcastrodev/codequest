import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import type { AssistantAction } from "@/hooks/useAssistant";

interface FakeAssistantButtonProps {
	hasContent: boolean;
	showingAssistant: boolean;
	onClick: () => void;
}

export function FakeAssistantButton({
	hasContent,
	showingAssistant,
	onClick,
}: FakeAssistantButtonProps) {
	if (!hasContent) return null;

	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={onClick}
			className={`
        w-11 h-11 rounded-full flex items-center justify-center text-xl
        shadow-lg transition-colors duration-200
        ${
			showingAssistant
				? "bg-secondary text-white shadow-[0_0_16px_rgba(124,92,252,0.5)]"
				: "bg-bg-elevated text-[#8888AA] hover:text-secondary hover:bg-bg-surface border border-bg-elevated hover:border-secondary/40"
		}
      `}
			aria-label="Assistente de aprendizado">
			🤖
		</motion.button>
	);
}

interface FakeAssistantModalProps {
	open: boolean;
	onClose: () => void;
	onRequest: (action: AssistantAction) => void;
}

const ACTION_LABELS: Record<AssistantAction, { label: string; icon: string }> =
	{
		explain: { label: "Explique de outro jeito", icon: "🔄" },
		examples: { label: "Dê mais exemplos", icon: "💡" },
		summary: { label: "Resuma em uma frase", icon: "📝" },
	};

export function FakeAssistantModal({
	open,
	onClose,
	onRequest,
}: FakeAssistantModalProps) {
	return (
		<Modal open={open} onClose={onClose} className="!p-0 max-w-sm">
			<div className="flex flex-col items-center pt-6 pb-2">
				<div className="w-16 h-16 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center text-3xl mb-3">
					🤖
				</div>
				<h2 className="font-heading font-bold text-lg text-[#E8E8F0]">
					Assistente
				</h2>
				<p className="text-xs text-[#8888AA] font-body mt-0.5">
					Como posso te ajudar?
				</p>
			</div>

			<div className="p-4 pt-1 space-y-1.5">
				{(Object.keys(ACTION_LABELS) as AssistantAction[]).map(
					(action) => (
						<button
							key={action}
							onClick={() => onRequest(action)}
							className="w-full px-4 py-3 rounded-xl text-sm font-body
              text-[#E8E8F0] hover:bg-bg-elevated transition-colors
              flex items-center justify-center gap-3 group border border-transparent hover:border-secondary/20">
							<span className="text-lg group-hover:scale-110 transition-transform">
								{ACTION_LABELS[action].icon}
							</span>
							<span className="group-hover:text-secondary transition-colors">
								{ACTION_LABELS[action].label}
							</span>
						</button>
					),
				)}
			</div>
		</Modal>
	);
}

interface AssistantContentNavProps {
	showingAssistant: boolean;
	hasAssistantContent: boolean;
	activeAction: AssistantAction | null;
	onShowOriginal: () => void;
	onShowAssistant: () => void;
}

const ACTION_SUBTITLES: Record<AssistantAction, string> = {
	explain: "Explicação alternativa",
	examples: "Exemplos",
	summary: "Resumo",
};

export function AssistantContentNav({
	showingAssistant,
	hasAssistantContent,
	activeAction,
	onShowOriginal,
	onShowAssistant,
}: AssistantContentNavProps) {
	if (!hasAssistantContent) return null;

	return (
		<div className="flex items-center justify-between px-1 mb-2">
			<button
				onClick={onShowOriginal}
				disabled={!showingAssistant}
				className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
          ${
				showingAssistant
					? "text-[#E8E8F0] hover:bg-bg-elevated cursor-pointer"
					: "text-[#8888AA]/30 cursor-default"
			}`}
				aria-label="Ver conteúdo original">
				←
			</button>
			<div className="text-center">
				{showingAssistant ? (
					<>
						<span className="text-xs font-body text-[#8888AA] block">
							🤖 Assistente
						</span>
						{activeAction && (
							<span className="text-[12px] font-body text-secondary">
								{ACTION_SUBTITLES[activeAction]}
							</span>
						)}
					</>
				) : (
					<span className="text-xs font-body text-[#8888AA]">
						Conteúdo original
					</span>
				)}
			</div>
			<button
				onClick={onShowAssistant}
				disabled={showingAssistant}
				className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
          ${
				!showingAssistant
					? "text-[#E8E8F0] hover:bg-bg-elevated cursor-pointer"
					: "text-[#8888AA]/30 cursor-default"
			}`}
				aria-label="Ver conteúdo do assistente">
				→
			</button>
		</div>
	);
}
