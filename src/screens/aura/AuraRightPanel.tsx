import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../../store/useStore";
import GlassPanel from "../../components/GlassPanel";

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function AuraRightPanel() {
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);

	const board = currentUserId ? boards[`board-${currentUserId}`] : undefined;
	const cards = board?.cards ?? {};
	const allCards = Object.values(cards);

	const total = allCards.length;
	const completed = allCards.filter((c) => c.completedAt).length;
	const projectProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

	const overdue = allCards.filter((c) => {
		if (c.completedAt || !c.dueDate) return false;
		return new Date(c.dueDate) < new Date(new Date().toDateString());
	}).length;

	const upcoming = allCards.filter((c) => {
		if (c.completedAt || !c.dueDate) return false;
		return new Date(c.dueDate) >= new Date(new Date().toDateString());
	}).length;

	// Timer state — wired to store
	const pomodoroSeconds = useStore((s) => s.pomodoroSeconds);
	const pomodoroRunning = useStore((s) => s.pomodoroRunning);
	const startPomodoro = useStore((s) => s.startPomodoro);
	const stopPomodoro = useStore((s) => s.stopPomodoro);
	const [timerMode, setTimerMode] = useState<"countdown" | "stopwatch">("countdown");
	const [targetMinutes, setTargetMinutes] = useState(25);
	const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
	const timerRef = useRef<number | null>(null);

	const clearTimer = useCallback(() => {
		if (timerRef.current !== null) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	// Stopwatch runs locally (store only tracks countdown)
	useEffect(() => {
		if (timerMode === "stopwatch" && pomodoroRunning) {
			timerRef.current = window.setInterval(() => {
				setStopwatchSeconds((prev) => prev + 1);
			}, 1000);
			return () => clearTimer();
		}
		clearTimer();
	}, [timerMode, pomodoroRunning, clearTimer]);

	const timerSeconds = timerMode === "countdown" ? pomodoroSeconds : stopwatchSeconds;

	function handleStart() {
		if (timerMode === "countdown") {
			startPomodoro();
		} else {
			// For stopwatch, reuse pomodoroRunning as the "running" flag
			startPomodoro();
		}
	}

	function handlePause() {
		stopPomodoro();
	}

	function handleReset() {
		clearTimer();
		stopPomodoro();
		if (timerMode === "stopwatch") {
			setStopwatchSeconds(0);
		}
	}

	function handleSetMinutes(mins: number) {
		setTargetMinutes(mins);
		// Reset the store timer to the new target
		useStore.setState({ pomodoroSeconds: mins * 60, pomodoroRunning: false });
	}

	function handleToggleMode() {
		clearTimer();
		setTimerRunning(false);
		if (timerMode === "countdown") {
			setTimerMode("stopwatch");
			setTimerSeconds(0);
		} else {
			setTimerMode("countdown");
			setTimerSeconds(targetMinutes * 60);
		}
	}

	const progress = timerMode === "countdown" && targetMinutes > 0
		? ((targetMinutes * 60 - timerSeconds) / (targetMinutes * 60)) * 100
		: 0;

	return (
		<div className="w-[220px] shrink-0 flex flex-col gap-3">
			{/* Project Info */}
			<GlassPanel className="p-4">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-1">Project</p>
				<p className="text-sm font-semibold text-white">Work</p>

				<div className="mt-3">
					<div className="flex items-center justify-between mb-1.5">
						<p className="text-[10px] text-white/40">Progress</p>
						<p className="text-[10px] text-white/60 font-medium">{projectProgress}%</p>
					</div>
					<div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
						<div
							className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
							style={{ width: `${projectProgress}%` }}
						/>
					</div>
				</div>
			</GlassPanel>

			{/* Team */}
			<GlassPanel className="p-4">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2">Team</p>
				<div className="flex items-center gap-1.5">
					<div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
						A
					</div>
					<div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white -ml-2 border-2 border-[#0a0a0f]/50">
						M
					</div>
					<span className="text-xs text-white/50 ml-1">Alex, Maria</span>
				</div>
			</GlassPanel>

			{/* Tasks Summary */}
			<GlassPanel className="p-4">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3">Tasks</p>
				<div className="flex gap-2">
					<div className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-center">
						<p className="text-lg font-bold text-red-400">{overdue}</p>
						<p className="text-[10px] text-red-400/60">Overdue</p>
					</div>
					<div className="flex-1 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-center">
						<p className="text-lg font-bold text-amber-400">{upcoming}</p>
						<p className="text-[10px] text-amber-400/60">Upcoming</p>
					</div>
				</div>
			</GlassPanel>

			{/* Timer */}
			<GlassPanel className="p-4">
				<div className="flex items-center justify-between mb-3">
					<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">
						{timerMode === "countdown" ? "Timer" : "Stopwatch"}
					</p>
					<button
						type="button"
						onClick={handleToggleMode}
						className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
					>
						{timerMode === "countdown" ? "Stopwatch →" : "← Timer"}
					</button>
				</div>

				{/* Timer display */}
				<div className="text-center mb-4">
					<p className="text-3xl font-bold text-white font-mono tracking-wider">
						{formatTime(timerSeconds)}
					</p>
					{timerMode === "countdown" && (
						<p className="text-[10px] text-white/30 mt-1">{targetMinutes} min target</p>
					)}
				</div>

				{/* Progress bar (countdown only) */}
				{timerMode === "countdown" && (
					<div className="h-1 rounded-full bg-white/5 overflow-hidden mb-4">
						<div
							className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
							style={{ width: `${progress}%` }}
						/>
					</div>
				)}

				{/* Custom time input (countdown only) */}
				{timerMode === "countdown" && !pomodoroRunning && (
					<div className="flex items-center gap-2 mb-4">
						<input
							type="number"
							min="1"
							max="180"
							value={targetMinutes}
							onChange={(e) => {
								const val = Math.max(1, Number(e.target.value) || 1);
								handleSetMinutes(val);
							}}
							className="w-16 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-center text-xs text-white font-mono outline-none focus:border-white/20 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
						<span className="text-[10px] text-white/40">min</span>
					</div>
				)}

				{/* Controls */}
				<div className="flex gap-2">
					<button
						type="button"
						onClick={pomodoroRunning ? handlePause : handleStart}
						className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-150
							${pomodoroRunning
								? "bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
								: "bg-white/10 border border-white/20 text-white hover:bg-white/15"
							}`}
					>
						{pomodoroRunning ? "Pause" : "Start"}
					</button>
					<button
						type="button"
						onClick={handleReset}
						className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/40 hover:text-white/70 hover:bg-white/10 transition-all duration-150"
					>
						Reset
					</button>
				</div>
			</GlassPanel>
		</div>
	);
}