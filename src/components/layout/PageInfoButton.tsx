import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";

interface PageTip {
	icon: string;
	label: string;
	detail: string;
}

interface PageInfo {
	title: string;
	tips: PageTip[];
}

function getPageInfo(pathname: string): PageInfo | null {
	if (pathname === "/") return null;

	if (pathname === "/playground") {
		return {
			title: "Dicas do Playground",
			tips: [
				{ icon: "▶", label: "Ctrl+Enter", detail: "Executar o codigo" },
				{ icon: "💾", label: "Ctrl+S", detail: "Salvar o projeto" },
				{
					icon: "📁",
					label: "Projetos",
					detail: "Gerencie seus codigos salvos",
				},
				{
					icon: "🧹",
					label: "Limpar",
					detail: "Limpe o console de saida",
				},
			],
		};
	}

	if (pathname.startsWith("/lesson/")) {
		return {
			title: "Dicas da Lição",
			tips: [
				{
					icon: "🤖",
					label: "Assistente",
					detail: "Peca explicacoes alternativas, exemplos ou resumos",
				},
				{
					icon: "◀▶",
					label: "Navegacao",
					detail: "Use os botoes para avancar entre os passos",
				},
				{
					icon: "📋",
					label: "Codigo",
					detail: "Blocos de codigo podem ser copiados",
				},
			],
		};
	}

	if (pathname.startsWith("/exercise/")) {
		return {
			title: "Dicas do Exercicio",
			tips: [
				{
					icon: "▶",
					label: "Ctrl+Enter",
					detail: "Executar seu codigo",
				},
				{
					icon: "💡",
					label: "Dicas",
					detail: "Peca dicas se precisar — cada dica reduz suas estrelas",
				},
				{
					icon: "🤖",
					label: "Assistente",
					detail: "Explicacoes alternativas disponiveis",
				},
				{
					icon: "🔄",
					label: "Resetar",
					detail: "Voltar ao codigo inicial",
				},
			],
		};
	}

	if (pathname.startsWith("/quiz/")) {
		return {
			title: "Dicas do Quiz",
			tips: [
				{
					icon: "✅",
					label: "Responder",
					detail: "Selecione uma opcao e confirme",
				},
				{
					icon: "📖",
					label: "Explicacao",
					detail: "Veja a explicacao apos cada resposta",
				},
				{
					icon: "⭐",
					label: "Estrelas",
					detail: "Acerte sem errar para ganhar mais estrelas",
				},
			],
		};
	}

	if (pathname === "/profile") {
		return {
			title: "Sobre o Perfil",
			tips: [
				{
					icon: "🏆",
					label: "Badges",
					detail: "Desbloqueie completando desafios especificos",
				},
				{
					icon: "⭐",
					label: "Estrelas",
					detail: "Complete exercicios sem dicas para ganhar 3 estrelas",
				},
				{
					icon: "🔥",
					label: "Ofensiva",
					detail: "Pratique todos os dias para manter sua sequencia",
				},
			],
		};
	}

	if (pathname === "/settings") {
		return {
			title: "Sobre as Configuracoes",
			tips: [
				{
					icon: "🔊",
					label: "Sons",
					detail: "Feedback sonoro para acertos e erros",
				},
				{
					icon: "🔄",
					label: "Resetar",
					detail: "Apaga todos os dados de progresso permanentemente",
				},
			],
		};
	}

	return {
		title: "Informacoes",
		tips: [
			{
				icon: "📚",
				label: "CodeQuest",
				detail: "Plataforma para aprender logica de programacao",
			},
			{
				icon: "🎮",
				label: "Gamificacao",
				detail: "Ganhe XP, suba de nivel e colecione badges",
			},
		],
	};
}

interface PageInfoButtonProps {
	showLabel?: boolean;
}

export function PageInfoButton({ showLabel = false }: PageInfoButtonProps) {
	const { pathname } = useLocation();
	const [open, setOpen] = useState(false);
	const info = getPageInfo(pathname);

	if (!info) return null;

	const allTips = [
		...info.tips,
		{ icon: "🔤", label: "Tamanho da fonte", detail: "Use o botao A ao lado para alternar entre 3 tamanhos de texto" },
		{ icon: "💬", label: "Feedback", detail: "Encontrou um bug ou tem uma sugestao? Use o botao roxo para nos enviar" },
	];

	return (
		<>
			<motion.button
				whileTap={{ scale: 0.9 }}
				onClick={() => setOpen(true)}
				className="flex items-center gap-2 group"
				title="Informacoes">
				<span className="w-7 h-7 flex items-center justify-center rounded-full border border-[#8888AA]/30 text-[#8888AA] group-hover:border-secondary/50 group-hover:text-secondary group-hover:bg-secondary/10 transition-colors font-heading font-bold text-sm">
					i
				</span>
				{showLabel && (
					<span className="text-xs text-[#8888AA] group-hover:text-[#E8E8F0] transition-colors font-body">
						Dicas e atalhos
					</span>
				)}
			</motion.button>

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title={info.title}>
				<div className="space-y-3">
					{allTips.map((tip, idx) => (
						<div
							key={idx}
							className="flex items-start gap-3 p-2 rounded-lg">
							<span className="text-base flex-shrink-0 mt-0.5">
								{tip.icon}
							</span>
							<div>
								<p className="font-body font-semibold text-sm text-[#E8E8F0]">
									{tip.label}
								</p>
								<p className="font-body text-xs text-[#8888AA]">
									{tip.detail}
								</p>
							</div>
						</div>
					))}
				</div>
			</Modal>
		</>
	);
}
