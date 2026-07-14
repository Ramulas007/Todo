import { useState, useEffect } from "react";
import type { Card, Priority } from "../../types/board.types";
import { useStore } from "../../store/useStore";
import TaskItem from "./TaskItem";

interface Props {
	card: Card;
	onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bg: string }[] = [
	{ value: "low", label: "Low", color: "text-slate-400", bg: "bg-slate-500/15" },
	{ value: "medium", label: "Medium", color: "text-blue-400", bg: "bg-blue-500/15" },
	{ value: "high", label: "High", color: "text-amber-400", bg: "bg-amber-500/15" },
	{ value: "urgent", label: "Urgent", color: "text-rose-400", bg: "bg-rose-500/15" },
];

export default function CardDetailModal({ card, onClose }: Props) {
	const updateCard = useStore((s) => s.updateCard);
	const completeTask = useStore((s) => s.completeTask);
	const deleteCard = useStore((s) => s.deleteCard);

	const [title, setTitle] = useState(card.title);
	const [description, setDescription] = useState(card.description);
	const [priority, setPriority] = useState<Priority>(card.priority ?? "medium");
	const [dueDate, setDueDate] = useState(card.dueDate ?? "");
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [activeTab, setActiveTab] = useState<"details" | "tasks" | "activity">("details");

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	function handleSave() {
		updateCard(card.id, {
			title: title.trim() || card.title,
			description: description.trim(),
			priority,
			dueDate: dueDate || undefined,
		});
		onClose();
	}

	function handleDelete() {
		if (confirm("Delete this card? This cannot be undone.")) {
			deleteCard(card.id);
			onClose();
		}
	}

	function addTask() {
		if (!newTaskTitle.trim()) return;
		const newTask = {
			id: `task-${Date.now()}`,
			title: newTaskTitle.trim(),
			description: "",
			isCompleted: false,
			createdAt: new Date().toISOString(),
		};
		updateCard(card.id, { tasks: [...card.tasks, newTask] });
		setNewTaskTitle("");
	}

	const total = card.tasks.length;
	const done = card.tasks.filter((t) => t.isCompleted).length;
	const pct = total > 0 ? Math.round((done / total) * 100) : 0;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
			onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#1a1d27] shadow-2xl shadow-black/40 animate-scale-in flex flex-col overflow-hidden">
				{/* Header */}
				<div className="flex items-start justify-between px-6 py-4 border-b border-white/5 shrink-0">
					<div className="flex-1 min-w-0">
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full text-lg font-semibold text-white bg-transparent border-none outline-none placeholder:text-slate-500"
							placeholder="Card title"
						/>
						<div className="flex items-center gap-2 mt-2">
							{card.priority && (
								<span className={`text-[10px] font-medium px-2 py-0.5 rounded ${PRIORITY_OPTIONS.find(p => p.value === card.priority)?.bg} ${PRIORITY_OPTIONS.find(p => p.value === card.priority)?.color}`}>
									{card.priority}
								</span>
							)}
							{card.dueDate && (
								<span className={`text-[10px] font-medium px-2 py-0.5 rounded ${new Date(card.dueDate) < new Date() ? "bg-rose-500/15 text-rose-400" : "bg-white/5 text-slate-500"}`}>
									Due {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
								</span>
							)}
							<span className="text-[10px] text-slate-600">
								{done}/{total} tasks
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0 ml-4">
						<button
							type="button"
							onClick={handleDelete}
							className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
							title="Delete card"
						>
							<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
								<path d="M2 4h12M5.33 4V2.67a.67.67 0 01.67-.67h4a.67.67 0 01.67.67V4M6.67 7.33v4M9.33 7.33v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M3.33 4l.67 9.33a1.33 1.33 0 001.33 1.34h5.34a1.33 1.33 0 001.33-1.34l.67-9.33" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</button>
						<button
							type="button"
							onClick={onClose}
							className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
						>
							<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
								<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex gap-1 px-6 pt-3 shrink-0">
					{(["details", "tasks", "activity"] as const).map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveTab(tab)}
							className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize
								${activeTab === tab ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
						>
							{tab}
						</button>
					))}
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-6 py-4">
					{activeTab === "details" && (
						<div className="space-y-5">
							{/* Description */}
							<div>
								<label className="block text-xs font-medium text-slate-400 mb-2">Description</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Add a more detailed description..."
									rows={4}
									className="w-full rounded-xl bg-[#22263a] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50 resize-none"
								/>
							</div>

							{/* Priority + Due Date */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-medium text-slate-400 mb-2">Priority</label>
									<div className="flex gap-1.5">
										{PRIORITY_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												type="button"
												onClick={() => setPriority(opt.value)}
												className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all
													${priority === opt.value ? `${opt.bg} ${opt.color} border border-white/20` : "bg-[#22263a] text-slate-500 border border-white/5 hover:border-white/10"}`}
											>
												{opt.label}
											</button>
										))}
									</div>
								</div>
								<div>
									<label className="block text-xs font-medium text-slate-400 mb-2">Due Date</label>
									<input
										type="date"
										value={dueDate}
										onChange={(e) => setDueDate(e.target.value)}
										className="w-full rounded-xl bg-[#22263a] border border-white/5 px-3 py-2 text-sm text-white outline-none transition-all focus:border-indigo-500/50 [color-scheme:dark]"
									/>
								</div>
							</div>

							{/* Tags */}
							{card.tags && card.tags.length > 0 && (
								<div>
									<label className="block text-xs font-medium text-slate-400 mb-2">Tags</label>
									<div className="flex flex-wrap gap-1.5">
										{card.tags.map((tag) => (
											<span key={tag} className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[11px] font-medium">
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === "tasks" && (
						<div className="space-y-3">
							{/* Progress */}
							{total > 0 && (
								<div>
									<div className="flex items-center justify-between mb-1.5">
										<span className="text-xs text-slate-500">{done}/{total} completed</span>
										<span className="text-xs text-slate-500">{pct}%</span>
									</div>
									<div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
										<div
											className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
											style={{ width: `${pct}%` }}
										/>
									</div>
								</div>
							)}

							{/* Task list */}
							<div className="space-y-1">
								{card.tasks.map((task) => (
									<TaskItem
										key={task.id}
										task={task}
										onComplete={() => completeTask(card.id, task.id)}
									/>
								))}
							</div>

							{/* Add task */}
							<div className="flex gap-2 pt-2">
								<input
									type="text"
									value={newTaskTitle}
									onChange={(e) => setNewTaskTitle(e.target.value)}
									onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTask(); } }}
									placeholder="Add a task..."
									className="flex-1 rounded-xl bg-[#22263a] border border-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-500/50"
								/>
								<button
									type="button"
									onClick={addTask}
									disabled={!newTaskTitle.trim()}
									className="px-3 py-2 rounded-xl bg-indigo-500 text-xs font-medium text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"
								>
									Add
								</button>
							</div>
						</div>
					)}

					{activeTab === "activity" && (
						<div className="space-y-3">
							{card.history.length === 0 ? (
								<p className="text-xs text-slate-500 text-center py-4">No activity yet</p>
							) : (
								[...card.history].reverse().map((event, i) => {
									const msAgo = Date.now() - new Date(event.timestamp).getTime();
									const hoursAgo = Math.floor(msAgo / (1000 * 60 * 60));
									const time = hoursAgo < 1 ? "Just now" : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

									const eventIcons: Record<string, string> = {
										created: "✨",
										moved: "→",
										completed: "✅",
										task_completed: "☑️",
										edited: "✏️",
									};

									return (
										<div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/3">
											<span className="text-sm mt-0.5">{eventIcons[event.type] ?? "•"}</span>
											<div className="flex-1 min-w-0">
												<p className="text-xs text-slate-300">
													{event.description ?? `${event.type.charAt(0).toUpperCase() + event.type.slice(1).replace('_', ' ')}`}
												</p>
												<p className="text-[10px] text-slate-600 mt-0.5">{time}</p>
											</div>
										</div>
									);
								})
							)}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5 shrink-0">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSave}
						className="px-5 py-2 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
					>
						Save Changes
					</button>
				</div>
			</div>
		</div>
	);
}
