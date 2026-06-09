import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { icons } from "@/components/ui/Icon";
import type { ReactNode } from "react";

interface PageTip {
	icon: ReactNode;
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
				{ icon: <icons.play />, label: "Ctrl+Enter", detail: "Executar o codigo" },
				{ icon: <icons.save />, label: "Ctrl+S", detail: "Salvar o projeto" },
				{
					icon: <icons.folderClosed />,
					label: "Projetos",
					detail: "Gerencie seus codigos salvos",
				},
				{
					icon: <icons.broom />,
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
					icon: <icons.cody />,
					label: "Cody",
					detail: "Peca explicacoes alternativas, exemplos ou resumos",
				},
				{
					icon: <><icons.playBack /><icons.play /></>,
					label: "Navegacao",
					detail: "Use os botoes para avancar entre os passos",
				},
				{
					icon: <icons.changelog />,
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
					icon: <icons.play />,
					label: "Ctrl+Enter",
					detail: "Executar seu codigo",
				},
				{
					icon: <icons.bulb />,
					label: "Dicas",
					detail: "Peca dicas se precisar — cada dica reduz suas estrelas",
				},
				{
					icon: <icons.cody />,
					label: "Cody",
					detail: "Explicacoes alternativas disponiveis",
				},
				{
					icon: <icons.refresh />,
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
					icon: <icons.checkCircle />,
					label: "Responder",
					detail: "Selecione uma opcao e confirme",
				},
				{
					icon: <icons.book />,
					label: "Explicacao",
					detail: "Veja a explicacao apos cada resposta",
				},
				{
					icon: <icons.star />,
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
					icon: <icons.trophy />,
					label: "Badges",
					detail: "Desbloqueie completando desafios especificos",
				},
				{
					icon: <icons.star />,
					label: "Estrelas",
					detail: "Complete exercicios sem dicas para ganhar 3 estrelas",
				},
				{
					icon: <icons.fire />,
					label: "Ofensiva",
					detail: "Pratique todos os dias para manter sua sequencia",
				},
			],
		};
	}

	if (pathname === "/changelog") {
		return {
			title: "Sobre o Changelog",
			tips: [
				{ icon: <icons.changelog />, label: "Versoes", detail: "Cada entrada mostra o que mudou em uma versao" },
				{ icon: <icons.changelog />, label: "Numeracao", detail: "Seguimos versionamento semantico (major.minor.patch)" },
			],
		};
	}

	if (pathname === "/settings") {
		return {
			title: "Sobre as Configuracoes",
			tips: [
				{
					icon: <icons.sound />,
					label: "Sons",
					detail: "Feedback sonoro para acertos e erros",
				},
				{
					icon: <icons.refresh />,
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
				icon: <icons.books />,
				label: "CodeQuest",
				detail: "Plataforma para aprender logica de programacao",
			},
			{
				icon: <icons.gamepad />,
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
		{ icon: "A", label: "Tamanho da fonte", detail: "Use o botao A ao lado para alternar entre 3 tamanhos de texto" },
		{ icon: <icons.speech />, label: "Feedback", detail: "Encontrou um bug ou tem uma sugestao? Use o botao de balao de fala na barra superior" },
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
