import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings.store";

const ROOT_SIZES = ["14px", "16px", "18px"] as const;

export function useFontScale() {
	const fontScale = useSettingsStore((s) => s.fontScale);

	useEffect(() => {
		document.documentElement.style.fontSize = ROOT_SIZES[fontScale];
	}, [fontScale]);
}
