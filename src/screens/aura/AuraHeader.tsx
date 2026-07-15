import { useState } from "react";
import { useStore } from "../../store/useStore";
import type { Priority } from "../../types/board.types";

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];
const PRIORITY_LABELS: Record<Priority, string> = { low: "Low", medium: "Med", high: "High", urgent: "Urgent" };
const PRIORITY_COLORS: Record<Priority, string> = {
	low: "text-white/40",
	medium: "text-blue-400",
	high: "text-orange-400",
	urgent: "text-red-400",
};

export default function AuraHeader() {
	const addCard = useStore((s) => s.addCard);
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const [newTitle, setNewTitle] = useState("");
	const [newPriority, setNewPriority] = useState<Priority>("medium");
	const [showForm, setShowForm] = useState(false);

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const firstListId = board?.lists[0]?.id;

	function handleAddTask() {
		if (!newTitle.trim() || !firstListId) return;
		addCard(firstListId, newTitle.trim(), newPriority);
		setNewTitle("");
		setNewPriority("medium");
		setShowForm(false);
	}

	function cyclePriority() {
		const idx = PRIORITIES.indexOf(newPriority);
		setNewPriority(PRIORITIES[(idx + 1) % PRIORITIES.length]);
	}

	return (
		<div className="glass rounded-2xl px-6 py-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-white">Today's Focus</h1>
					<p className="text-sm text-white/40 mt-0.5">
						{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
					</p>
				</div>

				<div className="flex items-center gap-3">
					<button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150">
						<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
							<path d="M12 5.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM13.5 13.5c0 2.5-5.5 3.5-7 3.5s-7-1-7-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
						</svg>
						Notifications
					</button>

					<button
						type="button"
						onClick={() => setShowForm(!showForm)}
						className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white hover:bg-white/15 transition-all duration-150"
					>
						<svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
							<path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
						Add Task
					</button>

					<div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
						AR
					</div>
				</div>
			</div>

			{/* Quick add form */}
			{showForm && (
				<div className="mt-4 flex items-center gap-3 animate-fade-in">
					<input
						type="text"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") setShowForm(false); }}
						placeholder="Task title..."
						autoFocus
						className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors"
					/>
					<button
						type="button"
						onClick={cyclePriority}
						className={`px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium transition-colors ${PRIORITY_COLORS[newPriority]}`}
					>
						{PRIORITY_LABELS[newPriority]}
					</button>
					<button
						type="button"
						onClick={handleAddTask}
						disabled={!newTitle.trim()}
						className="px-4 py-2.5 rounded-xl bg-indigo-500 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-40 transition-colors"
					>
						Add
					</button>
				</div>
			)}
		</div>
	);
}