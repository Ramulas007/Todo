import { useState, useMemo } from "react";
import { useStore } from "../../store/useStore";
import type { Card, Priority } from "../../types/board.types";
import TaskCard from "./TaskCard";
import GlassPanel from "../../components/GlassPanel";
import WorkDashboard from "./projects/WorkDashboard";
import PersonalView from "./projects/PersonalView";
import IdeasView from "./projects/IdeasView";
import TodayView from "../TodayView";

function getBacklogMovedAt(card: Card): string | null {
	const event = [...card.history].reverse().find(
		(e) => e.type === "moved" && e.description?.includes("Auto-moved to backlog")
	);
	return event?.timestamp ?? null;
}

function formatBacklogDate(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatBacklogTime(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AuraMain() {
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const addCard = useStore((s) => s.addCard);
	const activeView = useStore((s) => s.activeView);

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const cards = board?.cards ?? {};
	const lists = board?.lists ?? [];
	const allCards = Object.values(cards);

	// Filter state
	const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
	const [tagFilter, setTagFilter] = useState("");
	// Selection state
	const [selectMode, setSelectMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
	const [showMoveSelected, setShowMoveSelected] = useState(false);

	// Collect all unique tags
	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		allCards.forEach((c) => c.tags?.forEach((t) => tagSet.add(t)));
		return [...tagSet].sort();
	}, [allCards]);

	// Apply priority + tag filters
	const filteredByPriorityAndTag = useMemo(() => {
		let result = allCards;
		if (priorityFilter) {
			result = result.filter((c) => c.priority === priorityFilter);
		}
		if (tagFilter) {
			result = result.filter((c) => c.tags?.includes(tagFilter));
		}
		return result;
	}, [allCards, priorityFilter, tagFilter]);

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const backlogListId = lists.find((l) => l.title === "Backlog")?.id;
	const backlogCardIds = backlogListId
		? lists.find((l) => l.id === backlogListId)?.cardIds ?? []
		: [];
	const backlogCards = filteredByPriorityAndTag.filter((c) => backlogCardIds.includes(c.id));

	// Filter cards based on active view
	const filteredCards = activeView === "all"
		? filteredByPriorityAndTag
		: activeView === "backlog"
		? backlogCards
		: filteredByPriorityAndTag.filter((c) => c.tags?.includes(activeView));

	const firstListId = lists[0]?.id;

	function handleToggleSelect(cardId: string) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(cardId)) next.delete(cardId);
			else next.add(cardId);
			return next;
		});
	}

	function handleSelectAll() {
		const visibleIds = filteredCards.map((c) => c.id);
		if (selectedIds.size === visibleIds.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(visibleIds));
		}
	}

	function handleDeleteSelected() {
		useStore.getState().deleteCards([...selectedIds]);
		setSelectedIds(new Set());
		setSelectMode(false);
		setShowDeleteSelectedConfirm(false);
	}

	function handleMoveSelected(targetListId: string) {
		useStore.getState().moveCards([...selectedIds], targetListId);
		setSelectedIds(new Set());
		setSelectMode(false);
		setShowMoveSelected(false);
	}

	function handleAddTask() {
		if (firstListId) {
			addCard(firstListId, "New task");
		}
	}

	// ─── Project-specific views ─────────────────────────────────
	if (activeView === "today") return <TodayView onBackToBoard={() => setActiveView("all")} />;
	if (activeView === "work") return <WorkDashboard />;
	if (activeView === "personal") return <PersonalView />;
	if (activeView === "ideas") return <IdeasView />;

	// ─── Backlog view: filtered list, read-only ──────────────────
	if (activeView === "backlog") {
		return <BacklogView cards={backlogCards} />;
	}

	// ─── History view: all completed cards ──────────────────────
	if (activeView === "history") {
		return <HistoryView cards={allCards.filter((c) => !!c.completedAt)} />;
	}

	// ─── All / Project views: split into sections ────────────────
	const todayCards = filteredCards.filter((c) => {
		if (c.completedAt) return false;
		if (backlogCardIds.includes(c.id)) return false;
		if (!c.dueDate) return true;
		const due = new Date(c.dueDate);
		return due < tomorrow;
	});

	const upcomingCards = filteredCards.filter((c) => {
		if (c.completedAt) return false;
		if (backlogCardIds.includes(c.id)) return false;
		if (!c.dueDate) return false;
		const due = new Date(c.dueDate);
		return due >= tomorrow;
	});

	const completedCards = filteredCards.filter((c) => !!c.completedAt);

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pr-2">
			{/* Filter bar */}
			{(priorityFilter || tagFilter || allTags.length > 0) && (
				<div className="flex items-center gap-2 mb-4 flex-wrap">
					<span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Filter:</span>
					{(["low", "medium", "high", "urgent"] as Priority[]).map((p) => (
						<button
							key={p}
							type="button"
							onClick={() => setPriorityFilter(priorityFilter === p ? "" : p)}
							className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all capitalize
								${priorityFilter === p
									? p === "urgent" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
									: p === "high" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
									: p === "medium" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
									: "bg-white/10 text-white/60 border border-white/20"
								: "bg-white/5 text-white/30 border border-white/5 hover:text-white/50"
							}`}
						>
							{p}
						</button>
					))}
					{allTags.length > 0 && (
						<select
							value={tagFilter}
							onChange={(e) => setTagFilter(e.target.value)}
							className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/50 outline-none"
						>
							<option value="">All tags</option>
							{allTags.map((t) => (
								<option key={t} value={t}>{t}</option>
							))}
						</select>
					)}
					{(priorityFilter || tagFilter) && (
						<button
							type="button"
							onClick={() => { setPriorityFilter(""); setTagFilter(""); }}
							className="text-[10px] text-white/20 hover:text-white/50 transition-colors"
						>
							Clear
						</button>
					)}
				</div>
			)}

			{/* Selection toolbar */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
						className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all
							${selectMode ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"}`}
					>
						{selectMode ? `Selecting (${selectedIds.size})` : "Select"}
					</button>
					{selectMode && (
						<>
							<button
								type="button"
								onClick={handleSelectAll}
								className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/60 transition-colors"
							>
								{selectedIds.size === filteredCards.length ? "Deselect all" : "Select all"}
							</button>
							{selectedIds.size > 0 && (
								<>
									<button
										type="button"
										onClick={() => setShowMoveSelected(true)}
										className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/60 transition-colors"
									>
										Move ({selectedIds.size})
									</button>
									<button
										type="button"
										onClick={() => setShowDeleteSelectedConfirm(true)}
										className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/20 transition-colors"
									>
										Delete ({selectedIds.size})
									</button>
								</>
							)}
						</>
					)}
				</div>
			</div>

			{/* Today's Tasks */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-semibold text-white/70">Today's Tasks</h2>
				<span className="text-[10px] text-white/30">{todayCards.length} tasks</span>
			</div>
			{todayCards.length > 0 ? (
				<div className="grid grid-cols-2 gap-3 mb-8">
					{todayCards.map((card) => (
						<TaskCard key={card.id} card={card} selectMode={selectMode} selected={selectedIds.has(card.id)} onSelectToggle={handleToggleSelect} />
					))}
				</div>
			) : (
				<GlassPanel className="p-8 mb-8">
					<div className="text-center">
						<p className="text-sm text-white/40 mb-3">No tasks for today</p>
						<button type="button" onClick={handleAddTask}
							className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
							+ Add your first task
						</button>
					</div>
				</GlassPanel>
			)}

			{/* Backlog */}
			{backlogCards.length > 0 && (
				<>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-sm font-semibold text-red-400/70">Backlog</h2>
						<span className="text-[10px] text-red-400/40">{backlogCards.length} tasks</span>
					</div>
					<div className="grid grid-cols-2 gap-3 mb-8">
						{backlogCards.map((card) => (
							<TaskCard key={card.id} card={card} selectMode={selectMode} selected={selectedIds.has(card.id)} onSelectToggle={handleToggleSelect} />
						))}
					</div>
				</>
			)}

			{/* Upcoming */}
			{upcomingCards.length > 0 && (
				<>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-sm font-semibold text-white/70">Upcoming</h2>
						<span className="text-[10px] text-white/30">{upcomingCards.length} tasks</span>
					</div>
					<div className="grid grid-cols-2 gap-3 mb-8">
						{upcomingCards.map((card) => (
							<TaskCard key={card.id} card={card} selectMode={selectMode} selected={selectedIds.has(card.id)} onSelectToggle={handleToggleSelect} />
						))}
					</div>
				</>
			)}

			{/* Completed — show max 6 */}
			{completedCards.length > 0 && (
				<>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-sm font-semibold text-emerald-400/70">Completed</h2>
						<div className="flex items-center gap-2">
							<span className="text-[10px] text-emerald-400/40">{completedCards.length} done</span>
							<button
								type="button"
								onClick={() => useStore.getState().clearHistory()}
								className="text-[10px] text-white/20 hover:text-white/40 transition-colors"
							>
								Clear completed
							</button>
							{completedCards.length > 6 && (
								<button
									type="button"
									onClick={() => useStore.getState().setActiveView("history")}
									className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
								>
									View all →
								</button>
							)}
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3 mb-8">
						{completedCards.slice(0, 6).map((card) => (
							<TaskCard key={card.id} card={card} selectMode={selectMode} selected={selectedIds.has(card.id)} onSelectToggle={handleToggleSelect} />
						))}
					</div>
				</>
			)}

			{/* Empty state */}
			{filteredCards.length === 0 && (
				<GlassPanel className="p-12">
					<div className="text-center">
						<p className="text-lg text-white/30 mb-2">No tasks yet</p>
						<p className="text-sm text-white/20 mb-4">Create your first task to get started</p>
						<button type="button" onClick={handleAddTask}
							className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-sm font-medium text-indigo-400 hover:bg-indigo-500/30 transition-colors">
							+ New Task
						</button>
					</div>
				</GlassPanel>
			)}

			{/* Delete Selected Confirmation Modal */}
			{showDeleteSelectedConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteSelectedConfirm(false)} />
					<div className="relative w-[380px] rounded-2xl bg-[#1a1d2e] border border-white/10 p-6 shadow-2xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
								<svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
									<path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div>
								<h3 className="text-sm font-semibold text-white">Delete Selected</h3>
								<p className="text-[11px] text-white/40">This action cannot be undone</p>
							</div>
						</div>
						<p className="text-xs text-white/50 mb-5 leading-relaxed">
							This will permanently delete {selectedIds.size} selected task{selectedIds.size > 1 ? "s" : ""}.
						</p>
						<div className="flex items-center gap-2 justify-end">
							<button type="button" onClick={() => setShowDeleteSelectedConfirm(false)}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all">Cancel</button>
							<button type="button" onClick={handleDeleteSelected}
								className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all">Delete</button>
						</div>
					</div>
				</div>
			)}

			{/* Move Selected Modal */}
			{showMoveSelected && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMoveSelected(false)} />
					<div className="relative w-[380px] rounded-2xl bg-[#1a1d2e] border border-white/10 p-6 shadow-2xl">
						<h3 className="text-sm font-semibold text-white mb-4">Move {selectedIds.size} card{selectedIds.size > 1 ? "s" : ""} to...</h3>
						<div className="space-y-1.5 mb-5">
							{lists.map((list) => (
								<button key={list.id} type="button" onClick={() => handleMoveSelected(list.id)}
									className="w-full text-left px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all">
									{list.title}
								</button>
							))}
						</div>
						<div className="flex justify-end">
							<button type="button" onClick={() => setShowMoveSelected(false)}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all">Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Backlog View (with filters) ─────────────────────────────────────
function BacklogView({ cards }: { cards: Card[] }) {
	const [search, setSearch] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

	const filtered = useMemo(() => {
		let result = cards;

		// Search by title
		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(c) =>
					c.title.toLowerCase().includes(q) ||
					c.description.toLowerCase().includes(q)
			);
		}

		// Date range filter (based on when moved to backlog)
		if (dateFrom) {
			const from = new Date(dateFrom);
			from.setHours(0, 0, 0, 0);
			result = result.filter((c) => {
				const movedAt = getBacklogMovedAt(c);
				if (!movedAt) return false;
				return new Date(movedAt) >= from;
			});
		}
		if (dateTo) {
			const to = new Date(dateTo);
			to.setHours(23, 59, 59, 999);
			result = result.filter((c) => {
				const movedAt = getBacklogMovedAt(c);
				if (!movedAt) return false;
				return new Date(movedAt) <= to;
			});
		}

		// Sort by moved-to-backlog timestamp
		result = [...result].sort((a, b) => {
			const aTime = getBacklogMovedAt(a);
			const bTime = getBacklogMovedAt(b);
			if (!aTime && !bTime) return 0;
			if (!aTime) return 1;
			if (!bTime) return -1;
			return sortOrder === "newest"
				? new Date(bTime).getTime() - new Date(aTime).getTime()
				: new Date(aTime).getTime() - new Date(bTime).getTime();
		});

		return result;
	}, [cards, search, dateFrom, dateTo, sortOrder]);

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pr-2">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-semibold text-red-400/70">Backlog</h2>
				<span className="text-[10px] text-red-400/40">
					{filtered.length} of {cards.length} tasks
				</span>
			</div>

			{/* Filters */}
			{cards.length > 0 && (
				<div className="flex items-center gap-2 mb-4 flex-wrap">
					{/* Search */}
					<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
						<svg className="w-3 h-3 text-white/30" viewBox="0 0 16 16" fill="none">
							<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
							<path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search tasks..."
							className="bg-transparent outline-none text-white/70 placeholder:text-white/20 w-32"
						/>
						{search && (
							<button type="button" onClick={() => setSearch("")} className="text-white/20 hover:text-white/50">×</button>
						)}
					</div>

					{/* Date from */}
					<div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
						<span className="text-[10px] text-white/30">From</span>
						<input
							type="date"
							value={dateFrom}
							onChange={(e) => setDateFrom(e.target.value)}
							className="bg-transparent text-white/60 text-[11px] outline-none [color-scheme:dark] w-24"
						/>
						{dateFrom && (
							<button type="button" onClick={() => setDateFrom("")} className="text-white/20 hover:text-white/50 text-[10px]">×</button>
						)}
					</div>

					{/* Date to */}
					<div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
						<span className="text-[10px] text-white/30">To</span>
						<input
							type="date"
							value={dateTo}
							onChange={(e) => setDateTo(e.target.value)}
							className="bg-transparent text-white/60 text-[11px] outline-none [color-scheme:dark] w-24"
						/>
						{dateTo && (
							<button type="button" onClick={() => setDateTo("")} className="text-white/20 hover:text-white/50 text-[10px]">×</button>
						)}
					</div>

					{/* Sort */}
					<button
						type="button"
						onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
						className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 hover:text-white/60 transition-colors"
					>
						<svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
							<path d={sortOrder === "newest" ? "M2 3h8M2 6h5M2 9h2" : "M2 9h8M2 6h5M2 3h2"} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
						</svg>
						{sortOrder === "newest" ? "Newest" : "Oldest"}
					</button>
				</div>
			)}

			{/* Cards */}
			{filtered.length > 0 ? (
				<div className="grid grid-cols-2 gap-3">
					{filtered.map((card) => {
						const movedAt = getBacklogMovedAt(card);
						return (
							<div key={card.id}>
								<TaskCard card={card} />
								{movedAt && (
									<div className="flex items-center gap-1.5 mt-1 ml-1">
										<span className="text-[10px] text-white/20">Moved:</span>
										<span className="text-[10px] text-white/30">{formatBacklogDate(movedAt)}</span>
										<span className="text-[10px] text-white/20">{formatBacklogTime(movedAt)}</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : cards.length > 0 ? (
				<GlassPanel className="p-8">
					<div className="text-center">
						<p className="text-sm text-white/40">No matches</p>
						<p className="text-[11px] text-white/20 mt-1">Try adjusting your filters</p>
					</div>
				</GlassPanel>
			) : (
				<GlassPanel className="p-12">
					<div className="text-center">
						<p className="text-sm text-white/40">No backlog tasks</p>
						<p className="text-[11px] text-white/20 mt-1">Tasks with expired time limits will appear here</p>
					</div>
				</GlassPanel>
			)}
		</div>
	);
}

// ─── History View (all completed cards) ──────────────────────────────
function HistoryView({ cards }: { cards: Card[] }) {
	const clearHistory = useStore((s) => s.clearHistory);
	const deleteCards = useStore((s) => s.deleteCards);
	const [search, setSearch] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [showDeleteSelected, setShowDeleteSelected] = useState(false);

	const sorted = useMemo(() => {
		let result = [...cards].sort(
			(a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
		);

		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(c) =>
					c.title.toLowerCase().includes(q) ||
					c.description.toLowerCase().includes(q)
			);
		}

		if (dateFrom) {
			const from = new Date(dateFrom);
			from.setHours(0, 0, 0, 0);
			result = result.filter((c) => new Date(c.completedAt!) >= from);
		}
		if (dateTo) {
			const to = new Date(dateTo);
			to.setHours(23, 59, 59, 999);
			result = result.filter((c) => new Date(c.completedAt!) <= to);
		}

		return result;
	}, [cards, search, dateFrom, dateTo]);

	const allVisibleSelected = sorted.length > 0 && sorted.every((c) => selectedIds.has(String(c.id)));

	function toggleSelect(id: string | number) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			const key = String(id);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}

	function toggleSelectAll() {
		if (allVisibleSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(sorted.map((c) => String(c.id))));
		}
	}

	function handleDeleteSelected() {
		deleteCards([...selectedIds]);
		setSelectedIds(new Set());
		setShowDeleteSelected(false);
	}

	function handleClearAll() {
		clearHistory();
		setShowClearConfirm(false);
	}

	function formatCompletedDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	}

	function formatCompletedTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
	}

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pr-2">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-semibold text-emerald-400/70">History</h2>
				<div className="flex items-center gap-2">
					{selectedIds.size > 0 && (
						<button
							type="button"
							onClick={() => setShowDeleteSelected(true)}
							className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
						>
							Delete {selectedIds.size} selected
						</button>
					)}
					<span className="text-[10px] text-emerald-400/40">{sorted.length} completed</span>
					{cards.length > 0 && (
						<button
							type="button"
							onClick={() => setShowClearConfirm(true)}
							className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
						>
							Clear all
						</button>
					)}
				</div>
			</div>

			{/* Filters */}
			{cards.length > 0 && (
				<div className="flex items-center gap-2 mb-4 flex-wrap">
					{/* Select all checkbox */}
					<button
						type="button"
						onClick={toggleSelectAll}
						className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all
							${allVisibleSelected
								? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
								: "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
							}`}
					>
						<div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all
							${allVisibleSelected
								? "bg-indigo-500 border-indigo-500"
								: "border-white/20"
							}`}
						>
							{allVisibleSelected && (
								<svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
									<path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							)}
						</div>
						Select all
					</button>

					<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
						<svg className="w-3 h-3 text-white/30" viewBox="0 0 16 16" fill="none">
							<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
							<path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search completed tasks..."
							className="bg-transparent outline-none text-white/70 placeholder:text-white/20 w-40"
						/>
						{search && (
							<button type="button" onClick={() => setSearch("")} className="text-white/20 hover:text-white/50">×</button>
						)}
					</div>

					<div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
						<span className="text-[10px] text-white/30">From</span>
						<input
							type="date"
							value={dateFrom}
							onChange={(e) => setDateFrom(e.target.value)}
							className="bg-transparent text-white/60 text-[11px] outline-none [color-scheme:dark] w-24"
						/>
						{dateFrom && (
							<button type="button" onClick={() => setDateFrom("")} className="text-white/20 hover:text-white/50 text-[10px]">×</button>
						)}
					</div>

					<div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
						<span className="text-[10px] text-white/30">To</span>
						<input
							type="date"
							value={dateTo}
							onChange={(e) => setDateTo(e.target.value)}
							className="bg-transparent text-white/60 text-[11px] outline-none [color-scheme:dark] w-24"
						/>
						{dateTo && (
							<button type="button" onClick={() => setDateTo("")} className="text-white/20 hover:text-white/50 text-[10px]">×</button>
						)}
					</div>
				</div>
			)}

			{/* Cards */}
			{sorted.length > 0 ? (
				<div className="grid grid-cols-2 gap-3">
					{sorted.map((card) => {
						const isSelected = selectedIds.has(String(card.id));
						return (
							<div
								key={card.id}
								onClick={() => toggleSelect(card.id)}
								className={`relative cursor-pointer rounded-xl transition-all duration-150 ${
									isSelected ? "ring-1 ring-indigo-500/40" : ""
								}`}
							>
								{/* Selection checkbox */}
								<div className="absolute top-3 left-3 z-10">
									<div className={`w-4 h-4 rounded flex items-center justify-center border transition-all
										${isSelected
											? "bg-indigo-500 border-indigo-500"
											: "border-white/20 bg-white/5 hover:border-white/40"
										}`}
									>
										{isSelected && (
											<svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
												<path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											</svg>
										)}
									</div>
								</div>

								<div className={isSelected ? "opacity-80" : ""}>
									<TaskCard card={card} />
								</div>
								{card.completedAt && (
									<div className="flex items-center gap-1.5 mt-1 ml-1">
										<span className="text-[10px] text-white/20">Done:</span>
										<span className="text-[10px] text-white/30">{formatCompletedDate(card.completedAt)}</span>
										<span className="text-[10px] text-white/20">{formatCompletedTime(card.completedAt)}</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : cards.length > 0 ? (
				<GlassPanel className="p-8">
					<div className="text-center">
						<p className="text-sm text-white/40">No matches</p>
						<p className="text-[11px] text-white/20 mt-1">Try adjusting your filters</p>
					</div>
				</GlassPanel>
			) : (
				<GlassPanel className="p-12">
					<div className="text-center">
						<p className="text-sm text-white/40">No completed tasks yet</p>
						<p className="text-[11px] text-white/20 mt-1">Completed tasks will appear here</p>
					</div>
				</GlassPanel>
			)}

			{/* Delete Selected Confirmation Modal */}
			{showDeleteSelected && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteSelected(false)} />
					<div className="relative w-[380px] rounded-2xl bg-[#1a1d2e] border border-white/10 p-6 shadow-2xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
								<svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
									<path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div>
								<h3 className="text-sm font-semibold text-white">Delete Selected</h3>
								<p className="text-[11px] text-white/40">This action cannot be undone</p>
							</div>
						</div>
						<p className="text-xs text-white/50 mb-5 leading-relaxed">
							This will permanently delete {selectedIds.size} selected completed task{selectedIds.size > 1 ? "s" : ""}. Dashboard stats will be adjusted accordingly.
						</p>
						<div className="flex items-center gap-2 justify-end">
							<button
								type="button"
								onClick={() => setShowDeleteSelected(false)}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDeleteSelected}
								className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all"
							>
								Delete {selectedIds.size}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Clear All Confirmation Modal */}
			{showClearConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
					<div className="relative w-[380px] rounded-2xl bg-[#1a1d2e] border border-white/10 p-6 shadow-2xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
								<svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
									<path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div>
								<h3 className="text-sm font-semibold text-white">Clear All History</h3>
								<p className="text-[11px] text-white/40">This action cannot be undone</p>
							</div>
						</div>
						<p className="text-xs text-white/50 mb-5 leading-relaxed">
							This will permanently delete all {cards.length} completed tasks. Your dashboard stats (XP, level, streak, completion count) will also be reset to zero.
						</p>
						<div className="flex items-center gap-2 justify-end">
							<button
								type="button"
								onClick={() => setShowClearConfirm(false)}
								className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleClearAll}
								className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all"
							>
								Delete All
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}