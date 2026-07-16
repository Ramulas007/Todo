import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import BlobBackground from "../../components/BlobBackground";
import AuraSidebar from "./AuraSidebar";
import AuraHeader from "./AuraHeader";
import AuraMain from "./AuraMain";
import AuraRightPanel from "./AuraRightPanel";
import TaskPanel from "./TaskPanel";
import SearchPalette from "../../components/SearchPalette";
import { useStore } from "../../store/useStore";
import { useBreakpoint } from "../../hooks/useBreakpoint";

export default function AuraLayout() {
	const selectedCardId = useStore((s) => s.selectedCardId);
	const closePanel = useStore((s) => s.closePanel);
	const pomodoroRunning = useStore((s) => s.pomodoroRunning);
	const moveExpiredToBacklog = useStore((s) => s.moveExpiredToBacklog);
	const notificationPermission = useStore((s) => s.notificationPermission);
	const requestNotificationPermission = useStore((s) => s.requestNotificationPermission);
	const [dismissBanner, setDismissBanner] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [showSidebar, setShowSidebar] = useState(false);
	const [showRightPanel, setShowRightPanel] = useState(false);
	const bp = useBreakpoint();
	const isMobile = bp === "mobile";
	const isTablet = bp === "tablet";
	const isOverlay = isMobile || isTablet;
	const prefersReduced = useReducedMotion();

	useEffect(() => {
		const interval = setInterval(() => {
			moveExpiredToBacklog();
		}, 10000);
		return () => clearInterval(interval);
	}, [moveExpiredToBacklog]);

	useEffect(() => {
		if (!pomodoroRunning) return;
		const interval = setInterval(() => {
			useStore.setState((s) => {
				if (s.pomodoroSeconds <= 1) {
					return { pomodoroRunning: false, pomodoroSeconds: 25 * 60 };
				}
				return { pomodoroSeconds: s.pomodoroSeconds - 1 };
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [pomodoroRunning]);

	return (
		<div className="h-screen w-screen overflow-hidden relative">
			<BlobBackground />

			<div className="relative z-10 h-full flex gap-3 p-3">
				{/* Left Sidebar */}
				{isOverlay ? (
					<AnimatePresence>
						{showSidebar && (
							<>
								<motion.div
									initial={prefersReduced ? false : { opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={prefersReduced ? undefined : { opacity: 0 }}
									className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
									onClick={() => setShowSidebar(false)}
								/>
								<motion.div
									initial={prefersReduced ? false : { x: "-100%" }}
									animate={{ x: 0 }}
									exit={prefersReduced ? undefined : { x: "-100%" }}
									transition={{ type: "spring", damping: 25, stiffness: 300 }}
									className="fixed top-0 left-0 bottom-0 z-50 p-3"
								>
									<AuraSidebar
										onSearchOpen={() => { setShowSearch(true); setShowSidebar(false); }}
										onSettingsOpen={() => {}}
										onClose={() => setShowSidebar(false)}
									/>
								</motion.div>
							</>
						)}
					</AnimatePresence>
				) : (
					<AuraSidebar
						onSearchOpen={() => setShowSearch(true)}
						onSettingsOpen={() => {}}
					/>
				)}

				{/* Center Content */}
				<div className="flex-1 flex flex-col gap-3 min-w-0">
					<AuraHeader
						onHamburgerClick={() => setShowSidebar(true)}
						onPanelClick={() => setShowRightPanel(true)}
					/>
					<AuraMain />
				</div>

				{/* Right Panel */}
				{isOverlay ? (
					<AnimatePresence>
						{showRightPanel && (
							<AuraRightPanel onClose={() => setShowRightPanel(false)} />
						)}
					</AnimatePresence>
				) : (
					<AuraRightPanel />
				)}
			</div>

			{/* Slide-in Detail Panel */}
			<AnimatePresence>
				{selectedCardId && (
					<TaskPanel key={selectedCardId} onClose={closePanel} />
				)}
			</AnimatePresence>

			{/* Search Palette */}
			<AnimatePresence>
				{showSearch && (
					<SearchPalette
						key="search"
						onClose={() => setShowSearch(false)}
						onOpenCard={(cardId) => {
							useStore.getState().openPanel(cardId);
							setShowSearch(false);
						}}
					/>
				)}
			</AnimatePresence>

			{/* Notification permission banner */}
			{notificationPermission === "default" && !dismissBanner && (
				<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1d2e] border border-white/10 shadow-2xl">
					<span className="text-xs text-white/60">Get reminded before tasks are due?</span>
					<button type="button" onClick={requestNotificationPermission}
						className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-medium text-indigo-400 hover:bg-indigo-500/30 transition-colors">
						Enable
					</button>
					<button type="button" onClick={() => setDismissBanner(true)}
						className="text-[10px] text-white/30 hover:text-white/50 transition-colors">
						Dismiss
					</button>
				</div>
			)}
		</div>
	);
}
