import { useState } from "react";
import { useTodayView, type TodayCard } from "../hooks/useTodayView";
import { useStore } from "../store/useStore";
import CardDetailModal from "./board_components/CardDetailModal";

interface Props {
	onBackToBoard: () => void;
}

export default function TodayView({ onBackToBoard }: Props) {
	const { overdue, dueToday, suggested, completedToday, stats } = useTodayView();
	const updateCard = useStore((s) => s.updateCard);
	const moveCard = useStore((s) => s.moveCard);
	const board = useStore((s) => s.getBoard());
	const addXp = useStore((s) => s.addXp);
	const updateStreak = useStore((s) => s.updateStreak);
	const [editingCard, setEditingCard] = useState<TodayCard | null>(null);

	function handleToggleComplete(card: TodayCard) {
		const doneListId = board?.lists.find((l) => l.title === 'Done')?.id;
		const todoListId = board?.lists.find((l) => l.title === 'To Do')?.id;

		if (!card.completedAt && doneListId) {
			moveCard(String(card.id), doneListId);
			addXp(10);
			updateStreak();
		} else if (card.completedAt && doneListId && todoListId) {
			const isInDone = board?.lists.find((l) => l.id === doneListId)?.cardIds.includes(String(card.id));
			if (isInDone) {
				moveCard(String(card.id), todoListId);
			} else {
				updateCard(card.id, { completedAt: undefined });
			}
		}
	}

	const today = new Date();
	const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100">
			<div className="border-b border-white/[0.04]">
				<div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
					<div>
						<h1 className="text-lg font-semibold text-white">Today</h1>
						<p className="text-xs text-slate-500 mt-0.5">{dateStr}</p>
					</div>
					<button type="button" onClick={onBackToBoard}
						className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:border-white/[0.12] transition-all duration-150 flex items-center gap-1.5"
					>
						<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
							<path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						Board
					</button>
				</div>
			</div>

			<div className="mx-auto max-w-3xl px-6 py-8">
				<div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/[0.04]">
					{stats.overdue > 0 && (
						<div className="flex items-baseline gap-1.5">
							<span className="text-xl font-bold text-rose-400">{stats.overdue}</span>
							<span className="text-xs text-slate-500">overdue</span>
						</div>
					)}
					{stats.dueToday > 0 && (
						<div className="flex items-baseline gap-1.5">
							<span className="text-xl font-bold text-amber-400">{stats.dueToday}</span>
							<span className="text-xs text-slate-500">due today</span>
						</div>
					)}
					{stats.suggested > 0 && (
						<div className="flex items-baseline gap-1.5">
							<span className="text-xl font-bold text-indigo-400">{stats.suggested}</span>
							<span className="text-xs text-slate-500">suggested</span>
						</div>
					)}
					{stats.completedToday > 0 && (
						<div className="flex items-baseline gap-1.5">
							<span className="text-xl font-bold text-emerald-400">{stats.completedToday}</span>
							<span className="text-xs text-slate-500">done</span>
						</div>
					)}
					{stats.overdue === 0 && stats.dueToday === 0 && stats.suggested === 0 && stats.completedToday === 0 && (
						<p className="text-sm text-slate-500">Nothing on your plate today.</p>
					)}
				</div>

				<div className="space-y-8">
					{overdue.length > 0 && (
						<section>
							<h2 className="text-sm font-medium text-rose-400 mb-3">Overdue</h2>
							<div className="space-y-1.5">
								{overdue.map((card) => (
									<CardRow key={card.id} card={card} onToggle={handleToggleComplete} onClick={() => setEditingCard(card)} />
								))}
							</div>
						</section>
					)}

					{dueToday.length > 0 && (
						<section>
							<h2 className="text-sm font-medium text-amber-400 mb-3">Due Today</h2>
							<div className="space-y-1.5">
								{dueToday.map((card) => (
									<CardRow key={card.id} card={card} onToggle={handleToggleComplete} onClick={() => setEditingCard(card)} />
								))}
							</div>
						</section>
					)}

					{suggested.length > 0 && (
						<section>
							<h2 className="text-sm font-medium text-indigo-400 mb-3">Suggested Next</h2>
							<div className="space-y-1.5">
								{suggested.map((card, i) => (
									<CardRow key={card.id} card={card} rank={i + 1} onToggle={handleToggleComplete} onClick={() => setEditingCard(card)} />
								))}
							</div>
						</section>
					)}

					{completedToday.length > 0 && (
						<section>
							<h2 className="text-sm font-medium text-emerald-400 mb-3">Completed</h2>
							<div className="space-y-1.5">
								{completedToday.map((card) => (
									<CardRow key={card.id} card={card} onToggle={handleToggleComplete} onClick={() => setEditingCard(card)} />
								))}
							</div>
						</section>
					)}
				</div>

				{overdue.length === 0 && dueToday.length === 0 && suggested.length === 0 && completedToday.length === 0 && (
					<div className="text-center py-20">
						<p className="text-lg font-medium text-white mb-1">All clear</p>
						<p className="text-sm text-slate-500">Nothing overdue or due today. Nice work!</p>
					</div>
				)}
			</div>

			{editingCard && (
				<CardDetailModal card={editingCard} onClose={() => setEditingCard(null)} />
			)}
		</div>
	);
}

function CardRow({ card, rank, onToggle, onClick }: {
	card: TodayCard;
	rank?: number;
	onToggle: (card: TodayCard) => void;
	onClick: () => void;
}) {
	const priorityColors: Record<string, string> = {
		urgent: "bg-rose-500",
		high: "bg-amber-500",
		low: "bg-slate-500",
	};
	const priorityDot = card.priority && card.priority !== "medium"
		? priorityColors[card.priority] ?? "bg-slate-500"
		: null;

	return (
		<div className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150
			${card.completedAt
				? "border-white/[0.03] opacity-50"
				: "border-white/[0.06] bg-[#1e2235] hover:border-white/[0.12]"
			}`}
		>
			<button
				type="button"
				onClick={() => onToggle(card)}
				className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-150 border
					${card.completedAt
						? "bg-emerald-500 border-emerald-500"
						: "border-slate-600 hover:border-indigo-400"
					}`}
			>
				{card.completedAt && (
					<svg className="w-3 h-3 text-white" viewBox="0 0 10 10" fill="none">
						<path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				)}
			</button>

			{rank && (
				<span className="text-xs text-slate-600 w-4 text-center shrink-0 font-mono">{rank}</span>
			)}

			<button type="button" onClick={onClick} className="flex-1 min-w-0 text-left">
				<div className="flex items-center gap-2">
					<p className={`text-sm font-medium truncate ${card.completedAt ? "text-slate-500 line-through" : "text-slate-200"}`}>
						{card.title}
					</p>
					{priorityDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot}`} />}
				</div>
			</button>

			{card.reason && (
				<span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
					card.reason.includes("Overdue") ? "bg-rose-500/10 text-rose-400/70" :
					card.reason.includes("Urgent") || card.reason.includes("High") ? "bg-amber-500/10 text-amber-400/70" :
					"bg-white/[0.03] text-slate-500"
				}`}>
					{card.reason}
				</span>
			)}
		</div>
	);
}
