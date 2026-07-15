import { useEffect } from "react";
import BlobBackground from "../../components/BlobBackground";
import AuraSidebar from "./AuraSidebar";
import AuraHeader from "./AuraHeader";
import AuraMain from "./AuraMain";
import AuraRightPanel from "./AuraRightPanel";
import TaskPanel from "./TaskPanel";
import { useStore } from "../../store/useStore";

export default function AuraLayout() {
	const selectedCardId = useStore((s) => s.selectedCardId);
	const closePanel = useStore((s) => s.closePanel);
	const pomodoroRunning = useStore((s) => s.pomodoroRunning);
	const moveExpiredToBacklog = useStore((s) => s.moveExpiredToBacklog);

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
		</div>
	);
}