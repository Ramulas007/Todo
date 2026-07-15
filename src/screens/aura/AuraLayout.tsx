import { useEffect, useState } from "react";
import BlobBackground from "../../components/BlobBackground";
import AuraSidebar from "./AuraSidebar";
import AuraHeader from "./AuraHeader";
import AuraMain from "./AuraMain";
import AuraRightPanel from "./AuraRightPanel";
import TaskPanel from "./TaskPanel";
import { useStore } from "../../store/useStore";
import { useNotifications } from "../../hooks/useNotifications";

export default function AuraLayout() {
	const selectedCardId = useStore((s) => s.selectedCardId);
	const closePanel = useStore((s) => s.closePanel);
	const pomodoroRunning = useStore((s) => s.pomodoroRunning);
	const moveExpiredToBacklog = useStore((s) => s.moveExpiredToBacklog);
	const notificationPermission = useStore((s) => s.notificationPermission);
	const requestNotificationPermission = useStore((s) => s.requestNotificationPermission);
	const [dismissBanner, setDismissBanner] = useState(false);

	useNotifications();

	// Check for expired time limits every 10 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			moveExpiredToBacklog();
		}, 10000);
		return () => clearInterval(interval);
	}, [moveExpiredToBacklog]);

	// Pomodoro timer interval
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
				<AuraSidebar />

				{/* Center Content */}
				<div className="flex-1 flex flex-col gap-3 min-w-0">
					<AuraHeader />
					<AuraMain />
				</div>

				{/* Right Panel */}
				<AuraRightPanel />
			</div>

			{/* Slide-in Detail Panel */}
			{selectedCardId && (
				<TaskPanel onClose={closePanel} />
			)}

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