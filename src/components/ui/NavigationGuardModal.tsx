import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { icons } from "@/components/ui/Icon";

interface NavigationGuardModalProps {
	blocked: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function NavigationGuardModal({
	blocked,
	onConfirm,
	onCancel,
}: NavigationGuardModalProps) {
	return (
		<Modal open={blocked} onClose={onCancel} title="Sair sem salvar?">
			<div className="space-y-4">
				<p className="font-body text-sm text-text-muted leading-relaxed">
					<icons.warning className="inline text-warning mr-1.5 text-base align-text-bottom" />
					Você tem código não salvo no editor. Se sair agora, suas
					alterações serão perdidas.
				</p>
				<div className="flex justify-end gap-2">
					<Button variant="ghost" size="sm" onClick={onConfirm}>
						Sair
					</Button>
					<Button variant="accent" size="sm" onClick={onCancel}>
						Ficar
					</Button>
				</div>
			</div>
		</Modal>
	);
}
