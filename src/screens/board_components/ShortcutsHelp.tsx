import { useEffect } from "react";
import { SHORTCUT_DESCRIPTIONS } from "../../hooks/useKeyboardShortcuts";

interface Props {
	onClose: () => void;
}

export default function ShortcutsHelp({ onClose }: Props) {
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
			onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1d27] shadow-2xl shadow-black/40 animate-scale-in">
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
					<h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
					<button
						type="button"
						onClick={onClose}
						className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
					>
						<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				<div className="p-6 space-y-3">
					{SHORTCUT_DESCRIPTIONS.map((shortcut) => (
						<div key={shortcut.key} className="flex items-center justify-between py-2">
							<span className="text-sm text-slate-300">{shortcut.description}</span>
							<kbd className="px-2 py-1 rounded-lg bg-[#22263a] border border-white/10 text-xs font-mono text-slate-400">
								{shortcut.key}
							</kbd>
						</div>
					))}
				</div>

				<div className="px-6 py-4 border-t border-white/5">
					<p className="text-xs text-slate-500 text-center">
						Press <kbd className="px-1.5 py-0.5 rounded bg-[#22263a] border border-white/10 text-[10px] font-mono">?</kbd> anywhere to show this dialog
					</p>
				</div>
			</div>
		</div>
	);
}
