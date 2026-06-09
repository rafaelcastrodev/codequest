import { useState, useCallback, useRef } from "react";

export function useClipboard(resetMs = 1500) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>();

	const copy = useCallback(
		(text: string) => {
			navigator.clipboard.writeText(text).then(() => {
				setCopied(true);
				clearTimeout(timer.current);
				timer.current = setTimeout(() => setCopied(false), resetMs);
			});
		},
		[resetMs],
	);

	return { copied, copy };
}
