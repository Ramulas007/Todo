import { useStore } from "../../store/useStore";

const NAV_ITEMS = [
	{ id: "all", label: "All Tasks", icon: "◉" },
	{ id: "today", label: "Today", icon: "◎" },
	{ id: "backlog", label: "Backlog", icon: "◈" },
	{ id: "history", label: "History", icon: "◇" },
];

const PROJECTS = [
	{ id: "work", label: "Work", icon: "⏱" },
	{ id: "personal", label: "Personal", icon: "📓" },
	{ id: "ideas", label: "Ideas", icon: "💡" },
];

export default function AuraSidebar() {
	const activeView = useStore((s) => s.activeView);
	const setActiveView = useStore((s) => s.setActiveView);
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const cards = board?.cards ?? {};
	const allCards = Object.values(cards);

	const backlogListId = board?.lists.find((l) => l.title === "Backlog")?.id;
	const backlogCount = backlogListId
		? board?.lists.find((l) => l.id === backlogListId)?.cardIds.length ?? 0
		: 0;

	const completedCount = allCards.filter((c) => !!c.completedAt).length;

	// Count due/overdue cards for Today badge
	const todayDate = new Date();
	todayDate.setHours(0, 0, 0, 0);
	const todayCount = allCards.filter((c) => {
		if (c.completedAt) return false;
		if (!c.dueDate) return false;
		return new Date(c.dueDate) <= todayDate;
	}).length;

	// Count cards per project
	function countByProject(projectId: string) {
		return allCards.filter((c) => !c.completedAt && c.tags?.includes(projectId)).length;
	}

	return (
		<div className="w-[200px] shrink-0 glass rounded-2xl flex flex-col p-4">
			{/* Logo */}
			<div className="flex items-center gap-2.5 mb-6">
				<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
					AT
				</div>
				<span className="text-sm font-semibold text-white">AuraTask</span>
			</div>

			{/* Search */}
			<div className="mb-4">
				<div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/40">
					<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
						<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
						<path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
					</svg>
					Search
				</div>
			</div>

			{/* Navigation */}
			<nav className="space-y-1 mb-6">
				{NAV_ITEMS.map((item) => (
					<button
						key={item.id}
						type="button"
						onClick={() => setActiveView(item.id)}
						className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-150
							${activeView === item.id
								? "bg-white/10 text-white font-medium"
								: "text-white/50 hover:text-white/80 hover:bg-white/5"
							}`}
					>
						<div className="flex items-center gap-2.5">
							<span className="text-xs">{item.icon}</span>
							{item.label}
						</div>
						{item.id === "backlog" && backlogCount > 0 && (
							<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{backlogCount}</span>
						)}
						{item.id === "history" && completedCount > 0 && (
							<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{completedCount}</span>
						)}
						{item.id === "today" && todayCount > 0 && (
							<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{todayCount}</span>
						)}
					</button>
				))}
			</nav>

			{/* Projects */}
			<div className="mb-4">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2 px-3">Projects</p>
				<div className="space-y-0.5">
					{PROJECTS.map((project) => {
						const count = countByProject(project.id);
						return (
							<button
								key={project.id}
								type="button"
								onClick={() => setActiveView(project.id)}
								className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-all duration-150
									${activeView === project.id
										? "bg-white/10 text-white"
										: "text-white/50 hover:text-white/80 hover:bg-white/5"
									}`}
							>
								<div className="flex items-center gap-2.5">
									<span className="text-xs">{project.icon}</span>
									{project.label}
								</div>
								{count > 0 && (
									<span className="text-[10px] text-white/30">{count}</span>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Labels */}
			<div className="mb-4">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2 px-3">Labels</p>
			</div>

			{/* Spacer */}
			<div className="flex-1" />

			{/* Settings */}
			<button type="button" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150">
				<span className="text-xs">⚙</span>
				Settings
			</button>
		</div>
	);
}