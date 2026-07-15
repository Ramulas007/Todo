import { useState, useEffect, useRef, useMemo } from "react";
import { useStore } from "../store/useStore";
import type { Card } from "../types/board.types";

interface Props {
	onClose: () => void;
	onOpenCard: (cardId: string) => void;
}

export default function SearchPalette({ onClose, onOpenCard }: Props) {
	const searchCards = useStore((s) => s.searchCards);
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const [query, setQuery] = useState("");
	const [selectedIdx, setSelectedIdx] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const results = useMemo(() => {
		if (!query.trim() || !board) return [];
		const cards = searchCards(query);
		return cards.map((card) => {
			const listName = board.lists.find((l) => l.cardIds.includes(String(card.id)))?.title ?? "";
			return { card, listName };
		}).slice(0, 10);
	}, [query, searchCards, board]);

	useEffect(() => {
		setSelectedIdx(0);
	}, [results.length]);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((p) => Math.min(p + 1, results.length - 1)); }
			if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((p) => Math.max(p - 1, 0)); }
			if (e.key === "Enter" && results[selectedIdx]) {
				onOpenCard(String(results[selectedIdx].card.id));
				onClose();
			}
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [results, selectedIdx, onClose, onOpenCard]);

	const priorityColors: Record<string, string> = {
		urgent: "text-rose-400", high: "text-amber-400", medium: "text-blue-400", low: "text-white/40",
	};

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
			<div className="relative w-full max-w-lg mx-4">
				<div className="rounded-2xl bg-[#12121a] border border-white/10 shadow-2xl overflow-hidden">
					{/* Search input */}
					<div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
						<svg className="w-5 h-5 text-white/30 shrink-0" viewBox="0 0 20 20" fill="none">
							<circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5"/>
							<path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search tasks, tags, descriptions..."
							className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
						/>
						<kbd className="text-[10px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">ESC</kbd>
					</div>

					{/* Results */}
					<div className="max-h-[300px] overflow-y-auto">
						{query.trim() && results.length === 0 && (
							<div className="px-5 py-8 text-center">
								<p className="text-sm text-white/30">No results found</p>
							</div>
						)}
						{results.map(({ card, listName }, idx) => (
							<button
								key={String(card.id)}
								type="button"
								onClick={() => { onOpenCard(String(card.id)); onClose(); }}
								onMouseEnter={() => setSelectedIdx(idx)}
								className={`w-full px-5 py-3 text-left flex items-center gap-3 transition-colors
									${idx === selectedIdx ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-sm text-white/80 truncate">{card.title}</span>
										{card.priority && card.priority !== "medium" && (
											<span className={`text-[10px] capitalize ${priorityColors[card.priority]}`}>{card.priority}</span>
										)}
										{card.recurrence && (
											<span className="text-[10px] text-indigo-400">↻</span>
										)}
									</div>
									<div className="flex items-center gap-2 mt-0.5">
										{listName && <span className="text-[10px] text-white/25">{listName}</span>}
										{card.tags && card.tags.length > 0 && (
											<span className="text-[10px] text-white/20">{card.tags.join(", ")}</span>
										)}
									</div>
								</div>
								<svg className="w-3.5 h-3.5 text-white/20 shrink-0" viewBox="0 0 16 16" fill="none">
									<path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</button>
						))}
					</div>

					{/* Footer hint */}
					{results.length > 0 && (
						<div className="px-5 py-2 border-t border-white/5 flex items-center gap-4">
							<span className="text-[10px] text-white/20">↑↓ navigate</span>
							<span className="text-[10px] text-white/20">↵ open</span>
							<span className="text-[10px] text-white/20">esc close</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
