import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "workelo-theme";

function getStoredMode(): ThemeMode {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark" || stored === "system") {
		return stored;
	}
	return "system";
}

function systemPrefersDark() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveIsDark(mode: ThemeMode) {
	return mode === "dark" || (mode === "system" && systemPrefersDark());
}

function applyTheme(mode: ThemeMode) {
	document.documentElement.classList.toggle("dark", resolveIsDark(mode));
}

/**
 * Theme engine: persists a light/dark/system preference, keeps the root
 * `.dark` class in sync, and follows the OS when in `system` mode. The
 * initial class is set pre-paint by the inline script in index.html.
 */
export function useTheme() {
	const [mode, setMode] = useState<ThemeMode>(getStoredMode);

	// Apply + persist whenever the mode changes.
	useEffect(() => {
		applyTheme(mode);
		localStorage.setItem(STORAGE_KEY, mode);
	}, [mode]);

	// While in `system` mode, react to OS theme changes live.
	useEffect(() => {
		if (mode !== "system") return;
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [mode]);

	const isDark = resolveIsDark(mode);

	/** Toggle explicitly between light and dark (leaves `system` behind). */
	function toggle() {
		setMode(isDark ? "light" : "dark");
	}

	return { mode, setMode, isDark, toggle };
}
