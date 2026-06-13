import { useEffect, useCallback } from "react";
import { useBlocker } from "react-router-dom";

export function useNavigationGuard(isDirty: boolean) {
	const blocker = useBlocker(isDirty);

	useEffect(() => {
		if (!isDirty) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isDirty]);

	const confirm = useCallback(() => {
		if (blocker.state === "blocked") blocker.proceed();
	}, [blocker]);

	const cancel = useCallback(() => {
		if (blocker.state === "blocked") blocker.reset();
	}, [blocker]);

	return {
		blocked: blocker.state === "blocked",
		confirm,
		cancel,
	};
}
