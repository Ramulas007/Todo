import { motion, useReducedMotion } from "framer-motion";
import { useStore } from "../../store/useStore";
import type { Card } from "../../types/board.types";

interface Props {
	card: Card;
	selectMode?: boolean;
	selected?: boolean;
	onSelectToggle?: (cardId: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
	urgent: "border-l-red-500",
	high: "border-l-orange-500",
	medium: "border-l-blue-500",
	low: "border-l-white/20",
};

const PRIORITY_BADGES: Record<string, { bg: string; text: string; label: string }> = {
	urgent: { bg: "bg-red-500/20", text: "text-red-400", label: "Urgent" },
	high: { bg: "bg-orange-500/20", text: "text-orange-400", label: "High" },
	medium: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Medium" },
	low: { bg: "bg-white/10", text: "text-white/50", label: "Low" },
};

function getDueLabel(dueDate?: string): { text: string; color: string } | null {
	if (!dueDate) return null;
	const due = new Date(dueDate);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);

	if (diff < 0) return { text: `Overdue ${Math.abs(diff)}d`, color: "text-red-400" };
	if (diff === 0) return { text: "Due today", color: "text-emerald-400" };
	if (diff === 1) return { text: "Due tomorrow", color: "text-amber-400" };
	return { text: `Due in ${diff}d`, color: "text-white/40" };
}

function getAge(createdAt: string): string {
	const ms = Date.now() - new Date(createdAt).getTime();
	const days = Math.floor(ms / 86400000);
	if (days === 0) return "today";
	if (days === 1) return "1d";
	return `${days}d`;
}

export default function TaskCard({ card, selectMode, selected, onSelectToggle }: Props) {
	const openPanel = useStore((s) => s.openPanel);
	const toggleComplete = useStore((s) => s.toggleComplete);
	const prefersReduced = useReducedMotion();

	const total = card.tasks.length;
	const done = card.tasks.filter((t) => t.isCompleted).length;
	const priority = card.priority ?? "medium";
	const badge = PRIORITY_BADGES[priority];
	const borderColor = PRIORITY_COLORS[priority];
	const dueLabel = getDueLabel(card.dueDate);
	const age = getAge(card.createdAt);
	const isCompleted = !!card.completedAt;

	return (
		<motion.div
			layout
			layoutId={card.id}
			initial={prefersReduced ? false : { opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			whileHover={prefersReduced ? undefined : { scale: 1.02, y: -2 }}
			whileTap={prefersReduced ? undefined : { scale: 0.98 }}
			transition={{
				layout: { type: "spring", damping: 20, stiffness: 250 },
				opacity: { duration: 0.3 },
				y: { type: "spring", damping: 15, stiffness: 200 },
				scale: { duration: 0.2 },
			}}
			onClick={() => selectMode ? onSelectToggle?.(card.id) : openPanel(card.id)}
			className={`glass-card rounded-xl p-3.5 border-l-[3px] cursor-pointer
				hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-indigo-500/10
				${borderColor} ${isCompleted ? "opacity-50" : ""} ${selected ? "ring-2 ring-indigo-500/50 bg-indigo-500/10" : ""}
			`}
		>
			{/* Title row */}
			<div className="flex items-center gap-2.5 mb-2">
				{selectMode ? (
					<input
						type="checkbox"
						checked={selected}
						onChange={() => onSelectToggle?.(card.id)}
						className="checkbox-custom"
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<motion.div
						whileTap={prefersReduced ? undefined : { scale: 0.85 }}
						onClick={(e) => {
							e.stopPropagation();
							toggleComplete(card.id);
						}}
					>
						<input
							type="checkbox"
							checked={isCompleted}
							readOnly
							className="checkbox-custom"
						/>
					</motion.div>
				)}
				<span className={`text-sm font-medium flex-1 ${isCompleted ? "text-white/40 line-through" : "text-white"}`}>
					{card.title}
				</span>
				{badge && (
					<span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
						{badge.label}
					</span>
				)}
			</div>

			{/* Subtasks */}
			{total > 0 && (
				<div className="ml-7 space-y-1 mb-2">
					{card.tasks.slice(0, 3).map((task) => (
						<div key={task.id} className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={task.isCompleted}
								readOnly
								className="checkbox-custom !w-3 !h-3"
							/>
							<span className={`text-xs ${task.isCompleted ? "text-white/30 line-through" : "text-white/50"}`}>
								{task.title}
							</span>
						</div>
					))}
					{total > 3 && (
						<span className="text-[10px] text-white/30">+{total - 3} more</span>
					)}
				</div>
			)}

			{/* Footer */}
			<div className="flex items-center justify-between ml-7">
				<div className="flex items-center gap-3">
					{dueLabel && (
						<span className={`text-[10px] ${dueLabel.color}`}>{dueLabel.text}</span>
					)}
					{card.tags && card.tags.length > 0 && (
						<div className="flex gap-1">
							{card.tags.slice(0, 2).map((tag) => (
								<span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
									{tag}
								</span>
							))}
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="text-[10px] text-white/30">{age}</span>
					{total > 0 && (
						<span className="text-[10px] text-white/30">{done}/{total}</span>
					)}
				</div>
			</div>
		</motion.div>
	);
}
