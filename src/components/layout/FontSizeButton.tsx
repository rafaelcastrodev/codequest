import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settings.store";
import { icons } from "@/components/ui/Icon";

const LABELS = ["Menor", "Normal", "Maior"] as const;

export function FontSizeButton() {
	const fontScale = useSettingsStore((s) => s.fontScale);
	const cycle = useSettingsStore((s) => s.cycleFontScale);

	return (
		<motion.button
			whileTap={{ scale: 0.9 }}
			onClick={cycle}
			className="flex items-center gap-[3px] group"
			title={`Fonte: ${LABELS[fontScale]}`}
		>
			<span className="w-9 h-9 flex items-center justify-center rounded-full border border-text-muted/30 text-text-muted group-hover:border-secondary/50 group-hover:text-secondary group-hover:bg-secondary/10 transition-colors">
				<icons.fontSize size={18} />
			</span>
		</motion.button>
	);
}
