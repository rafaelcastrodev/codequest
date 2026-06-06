import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/settings.store";

const LABELS = ["Menor", "Normal", "Maior"] as const;
const ICON_SIZES = [10, 13, 16] as const;

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
			<span className="w-7 h-7 flex items-center justify-center rounded-full border border-[#8888AA]/30 text-[#8888AA] group-hover:border-secondary/50 group-hover:text-secondary group-hover:bg-secondary/10 transition-colors">
				<span
					className="font-heading font-bold"
					style={{ fontSize: ICON_SIZES[fontScale], lineHeight: 1 }}
				>
					A
				</span>
			</span>
		</motion.button>
	);
}
