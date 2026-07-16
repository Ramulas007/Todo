import { useStore } from "../../store/useStore";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { motion } from "framer-motion";

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

interface Props {
	onSearchOpen?: () => void;
	onSettingsOpen?: () => void;
	onClose?: () => void;
}

export default function AuraSidebar({ onSearchOpen, onSettingsOpen, onClose }: Props) {
	const activeView = useStore((s) => s.activeView);
	const setActiveView = useStore((s) => s.setActiveView);
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const bp = useBreakpoint();
	const collapsed = bp !== "desktop";

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const cards = board?.cards ?? {};
	const allCards = Object.values(cards);

	const backlogListId = board?.lists.find((l) => l.title === "Backlog")?.id;
	const backlogCount = backlogListId
		? board?.lists.find((l) => l.id === backlogListId)?.cardIds.length ?? 0
		: 0;

	const completedCount = allCards.filter((c) => !!c.completedAt).length;

	const todayDate = new Date();
	todayDate.setHours(0, 0, 0, 0);
	const todayCount = allCards.filter((c) => {
		if (c.completedAt) return false;
		if (!c.dueDate) return false;
		return new Date(c.dueDate) <= todayDate;
	}).length;

	function countByProject(projectId: string) {
		return allCards.filter((c) => !c.completedAt && c.tags?.includes(projectId)).length;
	}

	function handleNavClick(id: string) {
		setActiveView(id);
		if (bp !== "desktop") onClose?.();
	}

	return (
		<div className={`${collapsed ? "w-[56px]" : "w-[200px]"} shrink-0 glass rounded-2xl flex flex-col ${collapsed ? "p-2.5 items-center" : "p-4"} transition-all duration-200`}>
			{/* Logo */}
			<div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} mb-6`}>
				<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
					AT
				</div>
				{!collapsed && <span className="text-sm font-semibold text-white">AuraTask</span>}
			</div>

			{/* Search */}
			{!collapsed && (
				<div className="mb-4">
					<button type="button" onClick={onSearchOpen}
						className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all duration-150 cursor-pointer">
						<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
							<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
							<path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
						Search
						<kbd className="ml-auto text-[9px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">⌘K</kbd>
					</button>
				</div>
			)}

			{/* Navigation */}
			<nav className={`space-y-1 ${collapsed ? "mb-3" : "mb-6"} w-full`}>
				{NAV_ITEMS.map((item) => (
					<button
						key={item.id}
						type="button"
						onClick={() => handleNavClick(item.id)}
						title={collapsed ? item.label : undefined}
						className={`relative w-full flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-2 rounded-xl text-sm transition-all duration-150
							${activeView === item.id
								? "text-white font-medium"
								: "text-white/50 hover:text-white/80 hover:bg-white/5"
							}`}
					>
						{activeView === item.id && (
							<motion.div
								layoutId="sidebar-active"
								className="absolute inset-0 bg-white/10 rounded-xl"
								transition={{ type: "spring", damping: 20, stiffness: 300 }}
							/>
						)}
						<div className="relative z-10 flex items-center gap-2.5">
							<span className="text-xs">{item.icon}</span>
							{!collapsed && item.label}
						</div>
						{!collapsed && item.id === "backlog" && backlogCount > 0 && (
							<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 relative z-10">{backlogCount}</span>
						)}
						{!collapsed && item.id === "history" && completedCount > 0 && (
							<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 relative z-10">{completedCount}</span>
						)}
						{!collapsed && item.id === "today" && todayCount > 0 && (
							<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 relative z-10">{todayCount}</span>
						)}
					</button>
				))}
			</nav>

			{/* Projects */}
			{!collapsed && (
				<div className="mb-4 w-full">
					<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2 px-3">Projects</p>
					<div className="space-y-0.5">
						{PROJECTS.map((project) => {
							const count = countByProject(project.id);
							return (
								<button
									key={project.id}
									type="button"
									onClick={() => handleNavClick(project.id)}
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
			)}

			{/* Collapsed project icons */}
			{collapsed && (
				<nav className="space-y-1 mb-3 w-full">
					{PROJECTS.map((project) => (
						<button
							key={project.id}
							type="button"
							onClick={() => handleNavClick(project.id)}
							title={project.label}
							className={`w-full flex items-center justify-center px-3 py-2 rounded-xl text-sm transition-all duration-150
								${activeView === project.id
									? "bg-white/10 text-white font-medium"
									: "text-white/50 hover:text-white/80 hover:bg-white/5"
								}`}
						>
							<span className="text-xs">{project.icon}</span>
						</button>
					))}
				</nav>
			)}

			{/* Spacer */}
			<div className="flex-1" />

			{/* Settings */}
			<button type="button" onClick={onSettingsOpen}
				title={collapsed ? "Settings" : undefined}
				className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150 w-full`}>
				<span className="text-xs">⚙</span>
				{!collapsed && "Settings"}
			</button>
		</div>
	);
}
