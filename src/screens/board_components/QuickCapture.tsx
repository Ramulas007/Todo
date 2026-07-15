import { useState, useRef, useEffect } from "react";
import { useStore } from "../../store/useStore";
import type { Priority } from "../../types/board.types";

interface Props {
	onClose: () => void;
}

const PRIORITY_KEYS: { key: string; value: Priority; label: string }[] = [
	{ key: "1", value: "low", label: "Low" },
	{ key: "2", value: "medium", label: "Med" },
	{ key: "3", value: "high", label: "High" },
	{ key: "4", value: "urgent", label: "Urgent" },
];

export default function QuickCapture({ onClose }: Props) {
	const board = useStore((s) => s.getBoard());
	const createCard = useStore((s) => s.createCard);
	const [title, setTitle] = useState("");
	const [listIndex, setListIndex] = useState(0);
	const [priority, setPriority] = useState<Priority>("medium");
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const lists = board?.lists ?? [];
	const currentList = lists[listIndex];

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				onClose();
			}
			// Tab cycles through lists
			if (e.key === "Tab" && lists.length > 0) {
				e.preventDefault();
				setListIndex((prev) => (e.shiftKey
					? (prev - 1 + lists.length) % lists.length
					: (prev + 1) % lists.length
				));
			}
			// 1-4 sets priority
			const numKey = e.key;
			if (["1", "2", "3", "4"].includes(numKey) && !(e.target instanceof HTMLInputElement && e.target.type !== "text")) {
				const opt = PRIORITY_KEYS.find((p) => p.key === numKey);
				if (opt) setPriority(opt.value);
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose, lists.length]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!title.trim() || !currentList) return;

		createCard(currentList.id, {
			title: title.trim(),
			description: "",
			priority,
			tasks: [],
			position: currentList.cardIds.length,
			color: "#6366f1",
		});

		setToastMessage(`Card created in ${currentList.title}`);
		setShowToast(true);
		setTimeout(() => {
			setShowToast(false);
			setTitle("");
			inputRef.current?.focus();
		}, 1500);
	}

	if (lists.length === 0) return null;

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

			{/* Capture bar */}
			<div className="fixed top-24 left-1/2 -translate-x-1/2 z-[71] w-full max-w-xl px-4">
				<div className="rounded-2xl border border-white/10 bg-[#1a1d27]/95 backdrop-blur-xl shadow-2xl shadow-black/60 animate-slide-up">
					<form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3">
						<svg className="w-5 h-5 text-indigo-400 shrink-0" viewBox="0 0 20 20" fill="none">
							<path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						</svg>
						<input
							ref={inputRef}
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Quick add a card..."
							className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
						/>
						<button
							type="submit"
							disabled={!title.trim()}
							className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-500 text-xs font-semibold text-white hover:bg-indigo-400 transition-colors disabled:opacity-40"
						>
							Add
						</button>
					</form>

					{/* Options bar */}
					<div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 text-[11px]">
						<div className="flex items-center gap-3">
							<span className="text-slate-500">List:</span>
							<button
								type="button"
								onClick={() => setListIndex((prev) => (prev - 1 + lists.length) % lists.length)}
								className="text-slate-400 hover:text-white transition-colors"
							>
								<svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
									<path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							<span className="text-white font-medium min-w-[60px] text-center">{currentList?.title ?? "—"}</span>
							<button
								type="button"
								onClick={() => setListIndex((prev) => (prev + 1) % lists.length)}
								className="text-slate-400 hover:text-white transition-colors"
							>
								<svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
									<path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
						</div>

						<div className="flex items-center gap-1.5">
							{PRIORITY_KEYS.map((opt) => (
								<button
									key={opt.key}
									type="button"
									onClick={() => setPriority(opt.value)}
									className={`px-2 py-0.5 rounded font-medium transition-colors
										${priority === opt.value ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
								>
									{opt.key}:{opt.label}
								</button>
							))}
						</div>

						<span className="text-slate-600">Tab · Esc</span>
					</div>
				</div>
			</div>

			{/* Toast */}
			{showToast && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[72] px-4 py-2.5 rounded-xl bg-emerald-500/90 text-white text-sm font-medium shadow-lg animate-toast-slide">
					{toastMessage}
				</div>
			)}
		</>
	);
}