import { useState } from "react";
import { useStore } from "../../../store/useStore";
import type { Habit } from "../../../types/board.types";

const EMOJI_OPTIONS = ["💪", "📚", "🧘", "💧", "🏃", "🎯", "✍️", "🍎", "😴", "🧹"];
const COLOR_OPTIONS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function getStreak(habit: Habit): number {
	const dates = [...habit.completedDates].sort().reverse();
	if (dates.length === 0) return 0;
	let streak = 0;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const check = new Date(today);
	for (let i = 0; i < 365; i++) {
		const key = check.toISOString().slice(0, 10);
		if (dates.includes(key)) {
			streak++;
			check.setDate(check.getDate() - 1);
		} else if (i === 0) {
			// today might not be completed yet, skip
			check.setDate(check.getDate() - 1);
			continue;
		} else {
			break;
		}
	}
	return streak;
}

export default function HabitTracker() {
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const addHabit = useStore((s) => s.addHabit);
	const removeHabit = useStore((s) => s.removeHabit);
	const toggleHabitDay = useStore((s) => s.toggleHabitDay);

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const habits = board?.habits ?? [];

	const [showForm, setShowForm] = useState(false);
	const [newName, setNewName] = useState("");
	const [newIcon, setNewIcon] = useState(EMOJI_OPTIONS[0]);
	const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);

	const today = new Date().toISOString().slice(0, 10);

	// Last 7 days for grid
	const days: { key: string; label: string }[] = [];
	for (let i = 6; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		days.push({
			key: d.toISOString().slice(0, 10),
			label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
		});
	}

	function handleAdd() {
		if (!newName.trim()) return;
		addHabit(newName.trim(), newIcon, newColor);
		setNewName("");
		setNewIcon(EMOJI_OPTIONS[0]);
		setNewColor(COLOR_OPTIONS[0]);
		setShowForm(false);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Habits</h3>
				<button
					type="button"
					onClick={() => setShowForm(!showForm)}
					className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
				>
					{showForm ? "Cancel" : "+ Add"}
				</button>
			</div>

			{/* Today's progress bar */}
			{habits.length > 0 && (
				<div className="mb-3">
					<div className="flex items-center justify-between mb-1.5">
						<span className="text-[10px] text-white/30">Today's Progress</span>
						<span className="text-[10px] text-white/40 font-medium">
							{habits.filter((h) => h.completedDates.includes(today)).length}/{habits.length}
						</span>
					</div>
					<div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
						<div
							className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
							style={{
								width: `${habits.length > 0 ? (habits.filter((h) => h.completedDates.includes(today)).length / habits.length) * 100 : 0}%`,
							}}
						/>
					</div>
				</div>
			)}

			{/* Add form */}
			{showForm && (
				<div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
					<input
						type="text"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleAdd()}
						placeholder="Habit name..."
						autoFocus
						className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white placeholder:text-white/20 outline-none"
					/>
					<div className="flex gap-1">
						{EMOJI_OPTIONS.map((e) => (
							<button
								key={e}
								type="button"
								onClick={() => setNewIcon(e)}
								className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all
									${newIcon === e ? "bg-white/10 ring-1 ring-indigo-500/40" : "hover:bg-white/5"}`}
							>
								{e}
							</button>
						))}
					</div>
					<div className="flex gap-1">
						{COLOR_OPTIONS.map((c) => (
							<button
								key={c}
								type="button"
								onClick={() => setNewColor(c)}
								className={`w-5 h-5 rounded-full transition-all
									${newColor === c ? "ring-2 ring-white/40 scale-110" : "hover:scale-110"}`}
								style={{ backgroundColor: c }}
							/>
						))}
					</div>
					<button
						type="button"
						onClick={handleAdd}
						disabled={!newName.trim()}
						className="w-full py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-medium text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-40 transition-colors"
					>
						Add Habit
					</button>
				</div>
			)}

			{/* Habits list */}
			{habits.length > 0 ? (
				<div className="space-y-2 flex-1 overflow-y-auto">
					{/* Day headers */}
					<div className="flex items-center gap-2 px-1">
						<div className="flex-1" />
						{days.map((d) => (
							<span key={d.key} className={`w-8 text-center text-[9px] ${d.key === today ? "text-indigo-400 font-bold" : "text-white/20"}`}>
								{d.label}
							</span>
						))}
						<span className="w-10 text-center text-[9px] text-white/20">🔥</span>
						<span className="w-5" />
					</div>

					{habits.map((habit) => (
						<div key={habit.id} className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group">
							<div className="flex-1 min-w-0 flex items-center gap-2">
								<span className="text-sm">{habit.icon}</span>
								<span className="text-xs text-white/60 truncate">{habit.name}</span>
							</div>
							{days.map((d) => {
								const done = habit.completedDates.includes(d.key);
								return (
									<button
										key={d.key}
										type="button"
										onClick={() => toggleHabitDay(habit.id, d.key)}
										className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] transition-all
											${done
												? "text-white"
												: "bg-white/[0.03] border border-white/[0.06] hover:border-white/20"
											}`}
										style={done ? { backgroundColor: habit.color + "30", borderColor: habit.color + "50" } : undefined}
									>
										{done ? "✓" : ""}
									</button>
								);
							})}
							<span className="w-10 text-center text-xs text-amber-400 font-mono">
								{getStreak(habit)}
							</span>
							<button
								type="button"
								onClick={() => removeHabit(habit.id)}
								className="w-5 h-5 flex items-center justify-center text-white/0 group-hover:text-white/30 hover:text-red-400 transition-colors text-[10px]"
							>
								×
							</button>
						</div>
					))}
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<p className="text-xs text-white/20">No habits yet. Add one to start tracking.</p>
				</div>
			)}
		</div>
	);
}