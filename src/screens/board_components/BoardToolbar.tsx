import { useState } from "react";
import type { Priority } from "../../types/board.types";

interface Props {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	priorityFilter: Priority | null;
	onPriorityFilterChange: (priority: Priority | null) => void;
	dueDateFilter: "overdue" | "today" | "week" | null;
	onDueDateFilterChange: (filter: "overdue" | "today" | "week" | null) => void;
	onClearFilters: () => void;
}

export default function BoardToolbar({
	searchQuery,
	onSearchChange,
	priorityFilter,
	onPriorityFilterChange,
	dueDateFilter,
	onDueDateFilterChange,
	onClearFilters,
}: Props) {
	const [showFilters, setShowFilters] = useState(false);
	const hasFilters = priorityFilter || dueDateFilter || searchQuery;

	return (
		<div className="px-6 py-4 border-b border-white/5 bg-[#0f1117]/50">
			<div className="flex items-center gap-3">
				{/* Search */}
				<div className="flex-1 max-w-md relative">
					<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 16 16" fill="none">
						<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
						<path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
					</svg>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Search cards... (Ctrl+K)"
						className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1a1d27] border border-white/5 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => onSearchChange("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
						>
							<svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
								<path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>
					)}
				</div>

				{/* Filter toggle */}
				<button
					type="button"
					onClick={() => setShowFilters(!showFilters)}
					className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200
						${showFilters ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30" : "bg-[#1a1d27] border border-white/5 text-slate-400 hover:border-white/10 hover:text-white"}`}
				>
					<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
						<path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
					</svg>
					Filters
					{hasFilters && (
						<span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
					)}
				</button>

				{/* Clear filters */}
				{hasFilters && (
					<button
						type="button"
						onClick={onClearFilters}
						className="text-xs text-slate-500 hover:text-white transition-colors"
					>
						Clear
					</button>
				)}
			</div>

			{/* Filter chips */}
			{showFilters && (
				<div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
					{/* Priority filters */}
					<span className="text-[10px] text-slate-600 uppercase tracking-wider self-center mr-1">Priority:</span>
					{(["low", "medium", "high", "urgent"] as Priority[]).map((p) => (
						<button
							key={p}
							type="button"
							onClick={() => onPriorityFilterChange(priorityFilter === p ? null : p)}
							className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 capitalize
								${priorityFilter === p
									? "bg-white/10 border border-white/20 text-white"
									: "bg-[#1a1d27] border border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"}`}
						>
							{p}
						</button>
					))}

					<div className="w-px h-5 bg-white/10 mx-1" />

					{/* Due date filters */}
					<span className="text-[10px] text-slate-600 uppercase tracking-wider self-center mr-1">Due:</span>
					{([
						{ value: "overdue" as const, label: "Overdue" },
						{ value: "today" as const, label: "Today" },
						{ value: "week" as const, label: "This Week" },
					]).map((f) => (
						<button
							key={f.value}
							type="button"
							onClick={() => onDueDateFilterChange(dueDateFilter === f.value ? null : f.value)}
							className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200
								${dueDateFilter === f.value
									? "bg-white/10 border border-white/20 text-white"
									: "bg-[#1a1d27] border border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"}`}
						>
							{f.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
