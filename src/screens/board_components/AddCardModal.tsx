import { useState, useEffect, useRef } from "react";
import type { Priority } from "../../types/board.types";
import { useStore } from "../../store/useStore";

interface Props {
	listId: string;
	onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
	{ value: "low", label: "Low", color: "text-slate-400" },
	{ value: "medium", label: "Medium", color: "text-blue-400" },
	{ value: "high", label: "High", color: "text-amber-400" },
	{ value: "urgent", label: "Urgent", color: "text-rose-400" },
];

const TAG_SUGGESTIONS = ["bug", "feature", "design", "backend", "frontend", "urgent", "review"];

export default function AddCardModal({ listId, onClose }: Props) {
	const createCard = useStore((s) => s.createCard);
	const titleRef = useRef<HTMLInputElement>(null);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<Priority>("medium");
	const [dueDate, setDueDate] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!title.trim()) return;

		createCard(listId, {
			title: title.trim(),
			description: description.trim(),
			priority,
			dueDate: dueDate || undefined,
			tags: tags.length > 0 ? tags : undefined,
			tasks: [],
			position: 0,
			color: "#6366f1",
		});

		onClose();
	}

	function addTag(tag: string) {
		const t = tag.trim().toLowerCase();
		if (t && !tags.includes(t)) {
			setTags([...tags, t]);
		}
		setTagInput("");
	}

	function removeTag(tag: string) {
		setTags(tags.filter((t) => t !== tag));
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
			onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1d27] shadow-2xl shadow-black/40 animate-scale-in">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
					<h2 className="text-lg font-semibold text-white">New Card</h2>
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

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-5">
					{/* Title */}
					<div>
						<label className="block text-xs font-medium text-slate-400 mb-2">Title *</label>
						<input
							ref={titleRef}
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="What needs to be done?"
							className="w-full rounded-xl bg-[#22263a] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-xs font-medium text-slate-400 mb-2">Description</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add more details..."
							rows={3}
							className="w-full rounded-xl bg-[#22263a] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none"
						/>
					</div>

					{/* Priority + Due Date row */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium text-slate-400 mb-2">Priority</label>
							<div className="flex gap-2">
								{PRIORITY_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => setPriority(opt.value)}
										className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200
											${priority === opt.value
												? "bg-white/10 border border-white/20 text-white"
												: "bg-[#22263a] border border-white/5 text-slate-500 hover:border-white/10"
											}`}
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
								className="w-full rounded-xl bg-[#22263a] border border-white/5 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 [color-scheme:dark]"
							/>
						</div>
					</div>

					{/* Tags */}
					<div>
						<label className="block text-xs font-medium text-slate-400 mb-2">Tags</label>
						<div className="flex flex-wrap gap-2 mb-2">
							{tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-medium"
								>
									{tag}
									<button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
										<svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
											<path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
										</svg>
									</button>
								</span>
							))}
						</div>
						<div className="flex gap-2">
							<input
								type="text"
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
									if (e.key === "," ) { addTag(tagInput); }
								}}
								placeholder="Add tag..."
								className="flex-1 rounded-xl bg-[#22263a] border border-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50"
							/>
						</div>
						<div className="flex flex-wrap gap-1.5 mt-2">
							{TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).slice(0, 5).map((tag) => (
								<button
									key={tag}
									type="button"
									onClick={() => addTag(tag)}
									className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-white/5 hover:bg-white/10 hover:text-slate-300 transition-colors"
								>
									+ {tag}
								</button>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!title.trim()}
							className="px-5 py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Create Card
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
