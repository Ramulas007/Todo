import { useDraggable } from "@dnd-kit/react";
import type { Card } from "../../types/board.types";
import { useStore } from "../../store/useStore";
import TaskItem from "./TaskItem";

interface Props {
	card: Card;
	isOpen: boolean;
	onToggle: () => void;
}

const COLOR_MAP: Record<string, string> = {
	Blue: "#3b82f6", Green: "#10b981", Teal: "#14b8a6", Red: "#ef4444",
	Black: "#6366f1", "#3b82f6": "#3b82f6", "#10b981": "#10b981",
	"#14b8a6": "#14b8a6", "#ef4444": "#ef4444", "#6366f1": "#6366f1",
	"#f59e0b": "#f59e0b", "#8b5cf6": "#8b5cf6", "#f43f5e": "#f43f5e",
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
	low: { label: "Low", color: "text-slate-400", bg: "bg-slate-500/15" },
	medium: { label: "Med", color: "text-blue-400", bg: "bg-blue-500/15" },
	high: { label: "High", color: "text-amber-400", bg: "bg-amber-500/15" },
	urgent: { label: "Urgent", color: "text-rose-400", bg: "bg-rose-500/15" },
};

export default function CardItem({ card, isOpen, onToggle }: Props) {
	const completeTask = useStore((s) => s.completeTask);
	const total = card.tasks.length;
	const done = card.tasks.filter((t) => t.isCompleted).length;
	const pct = total > 0 ? Math.round((done / total) * 100) : 0;
	const allDone = total > 0 && done === total;

	const { ref, handleRef, isDragging } = useDraggable({ id: card.id });
	const accentColor = COLOR_MAP[card.color] ?? "#6366f1";
	const priority = card.priority ? PRIORITY_CONFIG[card.priority] : null;

	// Due date logic
	const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completedAt;
	const isDueSoon = card.dueDate && !isOverdue && new Date(card.dueDate) < new Date(Date.now() + 48 * 60 * 60 * 1000);

	return (
		<div
			ref={ref}
			className={`rounded-xl bg-[#22263a] border-l-[3px] overflow-hidden
				transition-all duration-200 
				${isDragging ? "opacity-50 shadow-xl" : ""}
				${isOpen
					? "border-indigo-500/60 shadow-lg shadow-indigo-500/10"
					: "border-white/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 hover:border-white/10"
				}
			`}
			style={{ borderLeftColor: isOpen ? undefined : accentColor }}
		>
			<button type="button" onClick={onToggle} className="w-full text-left p-3 cursor-pointer">
				{/* Title + controls */}
				<div className="flex items-start justify-between gap-2 mb-1.5">
					<span
						ref={handleRef}
						onClick={(e) => e.stopPropagation()}
						className="shrink-0 mt-0.5 cursor-grab active:cursor-grabbing touch-none text-slate-600 hover:text-slate-400 transition-colors"
					>
						<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
							<circle cx="2" cy="2" r="1.4" /><circle cx="8" cy="2" r="1.4" />
							<circle cx="2" cy="7" r="1.4" /><circle cx="8" cy="7" r="1.4" />
							<circle cx="2" cy="12" r="1.4" /><circle cx="8" cy="12" r="1.4" />
						</svg>
					</span>
					<p className="text-[13px] font-semibold text-slate-100 leading-snug flex-1">{card.title}</p>
					<div className="flex items-center gap-1.5 mt-0.5 shrink-0">
						{total > 0 && (
							<span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md
								${allDone ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-500"}`}
							>{done}/{total}</span>
						)}
						<svg className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
							viewBox="0 0 12 12" fill="none">
							<path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
				</div>

				{/* Metadata row */}
				<div className="flex items-center gap-2 mb-1.5 flex-wrap">
					{priority && (
						<span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priority.bg} ${priority.color}`}>
							{priority.label}
						</span>
					)}
					{card.dueDate && (
						<span className={`text-[10px] font-medium px-1.5 py-0.5 rounded
							${isOverdue ? "bg-rose-500/15 text-rose-400" : isDueSoon ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-slate-500"}`}
						>
							{new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
						</span>
					)}
					{card.tags?.map((tag) => (
						<span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
							{tag}
						</span>
					))}
				</div>

				{/* Description */}
				<p className={`text-xs text-slate-400 leading-relaxed ${isOpen ? "" : "line-clamp-2"}`}>
					{card.description}
				</p>
			</button>

			{/* Tasks — expanded */}
			{isOpen && total > 0 && (
				<div className="px-3 pb-3 animate-fade-in">
					<div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
						{card.tasks.map((task) => (
							<TaskItem
								key={task.id}
								task={task}
								onComplete={() => completeTask(card.id, task.id)}
							/>
						))}
					</div>
					<div className="mt-3 pt-2.5 border-t border-white/5">
						<div className="flex items-center justify-between mb-1.5">
							<span className="text-[10px] text-slate-500 font-medium">{done}/{total} completed</span>
							{allDone ? (
								<span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">All done ✓</span>
							) : (
								<span className="text-[10px] text-slate-500 font-medium">{pct}%</span>
							)}
						</div>
						<div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
							<div className={`h-full rounded-full transition-all duration-500
								${allDone ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-indigo-600 to-indigo-400"}`}
								style={{ width: `${pct}%` }}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Collapsed summary */}
			{!isOpen && total > 0 && (
				<div className="px-3 pb-3 -mt-0.5">
					<div className="flex items-center justify-between mb-1.5">
						<span className="text-[10px] text-slate-500 font-medium">{done}/{total} tasks</span>
						<span className="text-[10px] text-slate-500 font-medium">{pct}%</span>
					</div>
					<div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
						<div className={`h-full rounded-full transition-all duration-300
							${allDone ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-indigo-600 to-indigo-400"}`}
							style={{ width: `${pct}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
