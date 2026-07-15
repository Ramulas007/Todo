import { useMemo, useState } from "react";
import { useStore } from "../../../store/useStore";
import GlassPanel from "../../../components/GlassPanel";
import type { Card } from "../../../types/board.types";

type Range = "today" | "week" | "month";

function minsToHm(mins: number): string {
	if (mins < 60) return `${mins}m`;
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function startOfDay(d: Date) {
	const r = new Date(d);
	r.setHours(0, 0, 0, 0);
	return r;
}

export default function WorkDashboard() {
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const openPanel = useStore((s) => s.openPanel);
	const [range, setRange] = useState<Range>("week");

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const allCards = board ? Object.values(board.cards) : [];
	const lists = board?.lists ?? [];

	const now = new Date();
	const todayStart = startOfDay(now);

	// Date ranges
	const rangeStart = useMemo(() => {
		const d = new Date(todayStart);
		if (range === "today") return d;
		if (range === "week") { d.setDate(d.getDate() - 6); return d; }
		d.setDate(d.getDate() - 29);
		return d;
	}, [range, todayStart]);

	// Flatten all time entries with card info
	const entries = useMemo(() => {
		const result: { card: Card; date: Date; duration: number }[] = [];
		allCards.forEach((card) => {
			(card.timeEntries ?? []).forEach((e) => {
				const d = new Date(e.date);
				if (d >= rangeStart) result.push({ card, date: d, duration: e.duration });
			});
		});
		return result;
	}, [allCards, rangeStart]);

	const totalMins = entries.reduce((s, e) => s + e.duration, 0);
	const activeTaskIds = new Set(entries.map((e) => e.card.id));
	const activeCount = activeTaskIds.size;
	const dayCount = range === "today" ? 1 : range === "week" ? 7 : 30;
	const avgPerDay = Math.round(totalMins / dayCount);

	// Streak
	const streak = useMemo(() => {
		const daySet = new Set(entries.map((e) => startOfDay(e.date).toDateString()));
		let count = 0;
		const d = new Date(todayStart);
		while (daySet.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
		return count;
	}, [entries, todayStart]);

	// Bar chart: last 7 days
	const barData = useMemo(() => {
		const days: { label: string; mins: number; date: string }[] = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date(todayStart);
			d.setDate(d.getDate() - i);
			const key = d.toDateString();
			const mins = entries.filter((e) => startOfDay(e.date).toDateString() === key).reduce((s, e) => s + e.duration, 0);
			days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), mins, date: key });
		}
		return days;
	}, [entries, todayStart]);

	const maxBar = Math.max(...barData.map((d) => d.mins), 1);

	// Task pipeline: count cards per list
	const pipeline = useMemo(() => {
		return lists.map((l) => ({
			title: l.title,
			count: l.cardIds.length,
			color: l.title === "Done" ? "bg-emerald-500" : l.title === "In Progress" ? "bg-amber-500" : l.title === "Backlog" ? "bg-red-500" : "bg-blue-500",
		}));
	}, [lists]);

	const maxPipeline = Math.max(...pipeline.map((p) => p.count), 1);

	// Priority breakdown
	const priorityBreakdown = useMemo(() => {
		const counts: Record<string, number> = { urgent: 0, high: 0, medium: 0, low: 0 };
		allCards.filter((c) => !c.completedAt).forEach((c) => {
			counts[c.priority ?? "medium"]++;
		});
		return counts;
	}, [allCards]);

	// Overdue tasks
	const overdueTasks = useMemo(() => {
		const today = startOfDay(now);
		return allCards
			.filter((c) => !c.completedAt && c.dueDate && new Date(c.dueDate) < today)
			.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
			.slice(0, 5);
	}, [allCards, now]);

	// Top tasks by time
	const topTasks = useMemo(() => {
		const map = new Map<string, { card: Card; mins: number }>();
		entries.forEach((e) => {
			const existing = map.get(String(e.card.id));
			if (existing) existing.mins += e.duration;
			else map.set(String(e.card.id), { card: e.card, mins: e.duration });
		});
		return [...map.values()].sort((a, b) => b.mins - a.mins).slice(0, 5);
	}, [entries]);

	const PRIORITY_DOTS: Record<string, string> = {
		urgent: "bg-rose-500", high: "bg-orange-500", medium: "bg-blue-500", low: "bg-white/30",
	};

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pr-2">
			{/* Header */}
			<div className="flex items-center justify-between mb-5">
				<div>
					<h2 className="text-sm font-semibold text-white/80">Work Dashboard</h2>
					<p className="text-[11px] text-white/30 mt-0.5">
						{rangeStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
					</p>
				</div>
				<div className="flex gap-1">
					{(["today", "week", "month"] as Range[]).map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => setRange(r)}
							className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize
								${range === r ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400" : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"}`}
						>
							{r}
						</button>
					))}
				</div>
			</div>

			{/* Stats row */}
			<div className="grid grid-cols-4 gap-3 mb-5">
				{[
					{ label: "Total", value: minsToHm(totalMins), color: "text-indigo-400" },
					{ label: "Tasks", value: String(activeCount), color: "text-blue-400" },
					{ label: "Avg/Day", value: minsToHm(avgPerDay), color: "text-amber-400" },
					{ label: "Streak", value: `${streak}d`, color: "text-emerald-400" },
				].map((s) => (
					<GlassPanel key={s.label} className="p-3 text-center">
						<p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{s.label}</p>
						<p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
					</GlassPanel>
				))}
			</div>

			{/* Bar chart */}
			<GlassPanel className="p-4 mb-5">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">This Week</p>
				<div className="grid h-40 grid-cols-7 items-end gap-2">
					{barData.map((d) => (
						<div key={d.date} className="flex h-full flex-col justify-end gap-1">
							{d.mins > 0 && (
								<span className="text-[9px] text-white/30 text-center">{minsToHm(d.mins)}</span>
							)}
							<div className="flex flex-1 items-end">
								<div
									className="w-full rounded-t bg-gradient-to-t from-indigo-600/50 to-indigo-400/70 transition-all duration-500"
									style={{ height: `${Math.max((d.mins / maxBar) * 100, 3)}%` }}
								/>
							</div>
							<p className="text-center text-[10px] text-white/30">{d.label}</p>
						</div>
					))}
				</div>
			</GlassPanel>

			{/* Pipeline + Priority (2 columns) */}
			<div className="grid grid-cols-2 gap-3 mb-5">
				{/* Task Pipeline */}
				<GlassPanel className="p-4">
					<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Task Pipeline</p>
					<div className="space-y-2.5">
						{pipeline.map((p) => (
							<div key={p.title}>
								<div className="flex items-center justify-between text-xs mb-1">
									<span className="text-white/50">{p.title}</span>
									<span className="text-white/30 font-mono">{p.count}</span>
								</div>
								<div className="h-2 rounded-full bg-white/5 overflow-hidden">
									<div
										className={`h-full rounded-full ${p.color} transition-all duration-500`}
										style={{ width: `${Math.max((p.count / maxPipeline) * 100, 5)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</GlassPanel>

				{/* Priority Breakdown */}
				<GlassPanel className="p-4">
					<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Priority</p>
					<div className="space-y-2.5">
						{Object.entries(priorityBreakdown).map(([key, count]) => (
							<div key={key} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[key]}`} />
									<span className="text-xs text-white/50 capitalize">{key}</span>
								</div>
								<span className="text-xs text-white/30 font-mono">{count}</span>
							</div>
						))}
					</div>
				</GlassPanel>
			</div>

			{/* Overdue + Top Tasks (2 columns) */}
			<div className="grid grid-cols-2 gap-3">
				{/* Overdue Tasks */}
				<GlassPanel className="p-4">
					<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Overdue</p>
					{overdueTasks.length > 0 ? (
						<div className="space-y-1.5">
							{overdueTasks.map((card) => {
								const daysLate = Math.ceil((now.getTime() - new Date(card.dueDate!).getTime()) / 86400000);
								return (
									<button
										key={String(card.id)}
										type="button"
										onClick={() => openPanel(card.id)}
										className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all text-left"
									>
										<span className="text-rose-400/60 text-[10px]">⚠</span>
										<span className="text-xs text-white/60 truncate flex-1">{card.title}</span>
										<span className="text-[10px] text-rose-400/80 shrink-0">{daysLate}d late</span>
									</button>
								);
							})}
						</div>
					) : (
						<p className="text-xs text-white/20 text-center py-4">No overdue tasks</p>
					)}
				</GlassPanel>

				{/* Top Tasks by Time */}
				<GlassPanel className="p-4">
					<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Top Tasks by Time</p>
					{topTasks.length > 0 ? (
						<div className="space-y-1.5">
							{topTasks.map((t, i) => (
								<button
									key={String(t.card.id)}
									type="button"
									onClick={() => openPanel(t.card.id)}
									className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all text-left"
								>
									<span className="text-[10px] text-white/20 w-4 text-center shrink-0">{i + 1}</span>
									<span className="text-xs text-white/60 truncate flex-1">{t.card.title}</span>
									<span className="text-xs text-indigo-400 font-mono shrink-0">{minsToHm(t.mins)}</span>
								</button>
							))}
						</div>
					) : (
						<p className="text-xs text-white/20 text-center py-4">No time tracked yet</p>
					)}
				</GlassPanel>
			</div>
		</div>
	);
}