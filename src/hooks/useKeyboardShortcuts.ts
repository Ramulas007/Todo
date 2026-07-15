import { useEffect, useCallback } from "react";

interface ShortcutConfig {
	key: string;
ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	action: () => void;
	description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled = true) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!enabled) return;

			// Don't trigger shortcuts when typing in inputs
			const target = e.target as HTMLElement;
			const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

			for (const shortcut of shortcuts) {
				const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
				const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
				const altMatch = shortcut.alt ? e.altKey : !e.altKey;
				const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

				// Allow some shortcuts even in inputs (like Escape, Ctrl+ combinations)
				const isGlobalShortcut = shortcut.ctrl || shortcut.key === "Escape";

				if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
					if (!isInput || isGlobalShortcut) {
						e.preventDefault();
						shortcut.action();
						return;
					}
				}
			}
		},
		[shortcuts, enabled],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
}

// Predefined shortcut descriptions for help modal
export const SHORTCUT_DESCRIPTIONS = [
	{ key: "Ctrl+K", description: "Focus search" },
	{ key: "N", description: "New card (in focused column)" },
	{ key: "E", description: "Edit selected card" },
	{ key: "Del", description: "Delete selected card" },
	{ key: "1-4", description: "Switch to column" },
	{ key: "Escape", description: "Close modal / Clear selection" },
	{ key: "?", description: "Show keyboard shortcuts" },
	{ key: "Ctrl+Z", description: "Undo" },
	{ key: "Ctrl+Shift+Z", description: "Redo" },
];