import { useMemo } from "react";
import { useStore } from "../../../store/useStore";
import JournalEditor from "./JournalEditor";
import HabitTracker from "./HabitTracker";

export default function PersonalView() {
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;

	const today = new Date();
	const todayStr = today.toISOString().slice(0, 10);

	// Weekly summary stats
	const stats = useMemo(() => {
		const habits = board?.habits ?? [];
		const journal = board?.journalEntries ?? {};

		// Days this week with journal entries
		let journalDays = 0;
		for (let i = 6; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const key = d.toISOString().slice(0, 10);
			if (journal[key]) journalDays++;
		}

		// Total habits completed this week
		let habitsDone = 0;
		let totalPossible = 0;
		habits.forEach((h) => {
			for (let i = 6; i >= 0; i--) {
				const d = new Date(today);
				d.setDate(d.getDate() - i);
				const key = d.toISOString().slice(0, 10);
				totalPossible++;
				if (h.completedDates.includes(key)) habitsDone++;
			}
		});

		return { journalDays, habitsDone, totalPossible, habitCount: habits.length };
	}, [board?.habits, board?.journalEntries, today]);

	// Greeting based on time of day
	const hour = today.getHours();
	const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
	const userName = board?.ownerId?.split("-").pop() ?? "there";

	const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

	return (
		<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-base font-semibold text-white/80">
						{greeting} 👋
					</h2>
					<p className="text-[11px] text-white/30 mt-0.5">{dateStr}</p>
				</div>
				<div className="flex items-center gap-4">
					{stats.habitCount > 0 && (
						<div className="text-right">
							<p className="text-[10px] text-white/30">Today's Habits</p>
							<p className="text-sm font-bold text-amber-400">
								{stats.habitsDone}/{stats.totalPossible}
							</p>
						</div>
					)}
					{stats.journalDays > 0 && (
						<div className="text-right">
							<p className="text-[10px] text-white/30">Journal Streak</p>
							<p className="text-sm font-bold text-indigo-400">{stats.journalDays}d</p>
						</div>
					)}
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 flex gap-4 min-h-0">
				{/* Left: Journal */}
				<div className="flex-1 min-w-0 flex flex-col">
					<JournalEditor />
				</div>

				{/* Divider */}
				<div className="w-px bg-white/[0.06] shrink-0" />

				{/* Right: Habits */}
				<div className="w-[400px] shrink-0">
					<HabitTracker />
				</div>
			</div>

			{/* Weekly summary footer */}
			<div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-4">
				<p className="text-[10px] text-white/20">
					Weekly: {stats.journalDays}/7 days journaled · {stats.habitsDone} habits completed
				</p>
			</div>
		</div>
	);
}