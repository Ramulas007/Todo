import { useState, useEffect } from "react";
import { useStore } from "../../store/useStore";

interface Props {
	onClose: () => void;
}

function TimeRemaining({ timeLimit, startedAt }: { timeLimit: number; startedAt: string }) {
	const [remaining, setRemaining] = useState(0);

	useEffect(() => {
		function calc() {
			const elapsed = Date.now() - new Date(startedAt).getTime();
			const limitMs = timeLimit * 60 * 1000;
			return Math.max(0, Math.ceil((limitMs - elapsed) / 1000));
		}
		setRemaining(calc());
		const interval = setInterval(() => setRemaining(calc()), 1000);
		return () => clearInterval(interval);
	}, [timeLimit, startedAt]);

	const m = Math.floor(remaining / 60);
	const s = remaining % 60;
	const isLow = remaining < 60;

	return (
		<span className={`text-xs font-mono ${isLow ? "text-red-400" : "text-white/50"}`}>
			{m}:{String(s).padStart(2, "0")}
		</span>
	);
}

export default function TaskPanel({ onClose }: Props) {
	const selectedCardId = useStore((s) => s.selectedCardId);
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const updateCard = useStore((s) => s.updateCard);
	const deleteCard = useStore((s) => s.deleteCard);
	const toggleComplete = useStore((s) => s.toggleComplete);

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const card = selectedCardId && board ? board.cards[selectedCardId] : null;
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [draftTitle, setDraftTitle] = useState("");
	const [draftDescription, setDraftDescription] = useState("");
	const [initialized, setInitialized] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Initialize drafts when card changes
	if (card && !initialized) {
		setDraftTitle(card.title);
		setDraftDescription(card.description);
		setInitialized(true);
	}

	// Reset when card changes
	useEffect(() => {
		if (card) {
			setDraftTitle(card.title);
			setDraftDescription(card.description);
			setInitialized(true);
		}
	}, [card?.id]);

	if (!card) return null;

	const total = card.tasks.length;
	const done = card.tasks.filter((t) => t.isCompleted).length;
	const isCompleted = !!card.completedAt;

	function handleAddTask() {
		if (!card || !newTaskTitle.trim()) return;
		const newTasks = [
			...card.tasks,
			{
				id: `task-${Date.now()}`,
				title: newTaskTitle.trim(),
				description: "",
				isCompleted: false,
				createdAt: new Date().toISOString(),
			},
		];
		updateCard(card.id, { tasks: newTasks });
		setNewTaskTitle("");
	}

	function handleToggleTask(taskId: string) {
		if (!card) return;
		const newTasks = card.tasks.map((t) =>
			t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
		);
		updateCard(card.id, { tasks: newTasks });
	}

	function handleDelete() {
		if (!card) return;
		deleteCard(card.id);
		onClose();
	}

	return (
		<div className="fixed inset-y-0 right-0 w-[480px] z-50 flex">
			{/* Backdrop */}
			<div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

			{/* Panel */}
			<div className="w-[480px] bg-[#121218] border-l border-white/10 flex flex-col animate-slide-in-right">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
					<button type="button" onClick={onClose} className="text-sm text-white/40 hover:text-white/70 transition-colors">
						← Back
					</button>
					<div className="flex items-center gap-2">
						<button type="button" onClick={() => setShowDeleteConfirm(true)} className="text-sm text-red-400/60 hover:text-red-400 transition-colors">
							Delete
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
					{/* Title */}
					<div className="flex items-start gap-3">
						<input
							type="checkbox"
							checked={isCompleted}
							onChange={() => toggleComplete(card.id)}
							className="checkbox-custom mt-1"
						/>
						<input
							type="text"
							value={draftTitle}
							onChange={(e) => setDraftTitle(e.target.value)}
							onBlur={() => updateCard(card.id, { title: draftTitle })}
							className="flex-1 text-lg font-semibold text-white bg-transparent border-none outline-none placeholder:text-white/30"
							placeholder="Task title"
						/>
					</div>

					{/* Description */}
					<div>
						<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2">Description</p>
						<textarea
							value={draftDescription}
							onChange={(e) => setDraftDescription(e.target.value)}
							onBlur={() => updateCard(card.id, { description: draftDescription })}
							placeholder="Add a description..."
							rows={3}
							className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70 placeholder:text-white/20 outline-none resize-none focus:border-white/20 transition-colors"
						/>
					</div>

					{/* Tasks */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Tasks</p>
							{total > 0 && (
								<span className="text-[10px] text-white/40">{done}/{total}</span>
							)}
						</div>

						<div className="space-y-1.5">
							{card.tasks.map((task) => (
								<div key={task.id} className="flex items-center gap-2.5 py-1.5 group">
									<input
										type="checkbox"
										checked={task.isCompleted}
										onChange={() => handleToggleTask(task.id)}
										className="checkbox-custom"
									/>
									<span className={`text-sm flex-1 ${task.isCompleted ? "text-white/30 line-through" : "text-white/70"}`}>
										{task.title}
									</span>
								</div>
							))}
						</div>

						{/* Add task */}
						<div className="mt-3 flex gap-2">
							<input
								type="text"
								value={newTaskTitle}
								onChange={(e) => setNewTaskTitle(e.target.value)}
								onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); }}
								placeholder="Add a task..."
								className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
							/>
							<button
								type="button"
								onClick={handleAddTask}
								disabled={!newTaskTitle.trim()}
								className="px-3 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-xs font-medium text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-40 transition-colors"
							>
								Add
							</button>
						</div>
					</div>

					{/* Properties */}
					<div>
						<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Properties</p>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs text-white/40">Priority</span>
								<select
									value={card.priority ?? "medium"}
									onChange={(e) => updateCard(card.id, { priority: e.target.value as any })}
									className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none"
								>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
									<option value="urgent">Urgent</option>
								</select>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs text-white/40">Due date</span>
								<div className="flex items-center gap-2">
									<input
										type="date"
										value={card.dueDate ?? ""}
										onChange={(e) => {
											const date = e.target.value
											updateCard(card.id, {
												dueDate: date || undefined,
												dueTime: date && !card.dueTime ? "23:59" : card.dueTime,
											})
										}}
										className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none [color-scheme:dark]"
									/>
									{card.dueDate && (
										<input
											type="time"
											value={card.dueTime ?? "23:59"}
											onChange={(e) => updateCard(card.id, { dueTime: e.target.value || "23:59" })}
											className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none [color-scheme:dark]"
										/>
									)}
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs text-white/40">Time limit</span>
								<div className="flex items-center gap-2">
									<select
										value={card.timeLimit ?? ""}
										onChange={(e) => {
											const val = e.target.value ? Number(e.target.value) : undefined;
											updateCard(card.id, {
												timeLimit: val,
												timeLimitStartedAt: val ? new Date().toISOString() : undefined,
											});
										}}
										className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none"
									>
										<option value="">None</option>
										<option value="1">1 min</option>
										<option value="2">2 min</option>
										<option value="5">5 min</option>
										<option value="10">10 min</option>
										<option value="15">15 min</option>
										<option value="25">25 min</option>
										<option value="30">30 min</option>
										<option value="60">60 min</option>
									</select>
									{card.timeLimit && card.timeLimitStartedAt && (
										<button
											type="button"
											onClick={() => updateCard(card.id, { timeLimitStartedAt: new Date().toISOString() })}
											className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
											title="Reset timer"
										>
											↺
										</button>
									)}
								</div>
							</div>
							{card.timeLimit && card.timeLimitStartedAt && !card.completedAt && (
								<div className="flex items-center justify-between">
									<span className="text-xs text-white/40">Remaining</span>
									<TimeRemaining timeLimit={card.timeLimit} startedAt={card.timeLimitStartedAt} />
								</div>
							)}
							<div className="flex items-center justify-between">
								<span className="text-xs text-white/40">Created</span>
								<span className="text-xs text-white/50">
									{new Date(card.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
								</span>
							</div>
						</div>
					</div>

					{/* Activity */}
					<div>
						<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Activity</p>
						<div className="space-y-2">
							{[...card.history].reverse().slice(0, 5).map((event, i) => {
								const msAgo = Date.now() - new Date(event.timestamp).getTime();
								const hrs = Math.floor(msAgo / 3600000);
								const time = hrs < 1 ? "Just now" : hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;

								return (
									<div key={i} className="flex items-start gap-2 text-xs text-white/40">
										<span className="mt-0.5">•</span>
										<span>{event.description ?? event.type}</span>
										<span className="ml-auto shrink-0">{time}</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
					<div className="relative w-[380px] rounded-2xl bg-[#1a1d2e] border border-white/10 p-6 shadow-2xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
								<svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
									<path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div>
								<h3 className="text-sm font-semibold text-white">Delete "{card.title}"?</h3>
								<p className="text-[11px] text-white/40">This cannot be undone</p>
							</div>
						</div>
						<p className="text-xs text-white/50 mb-5 leading-relaxed">
							This will permanently delete this card and all its tasks. Your dashboard stats will be adjusted accordingly.
						</p>
						<div className="flex items-center gap-2 justify-end">
							<button
								type="button"
								onClick={() => setShowDeleteConfirm(false)}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDelete}
								className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}