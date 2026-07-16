import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../../store/useStore";
import GlassPanel from "../../components/GlassPanel";
import { useBreakpoint } from "../../hooks/useBreakpoint";

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface Props {
	onClose?: () => void;
}

export default function AuraRightPanel({ onClose }: Props) {
	const boards = useStore((s) => s.boards);
	const currentUserId = useStore((s) => s.currentUserId);
	const bp = useBreakpoint();
	const isMobile = bp === "mobile";
	const isTablet = bp === "tablet";

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
		useStore.setState({ pomodoroSeconds: mins * 60, pomodoroRunning: false });
	}

	function handleToggleMode() {
		clearTimer();
		useStore.setState({ pomodoroRunning: false });
		if (timerMode === "countdown") {
			setTimerMode("stopwatch");
			useStore.setState({ pomodoroSeconds: 0 });
		} else {
			setTimerMode("countdown");
			useStore.setState({ pomodoroSeconds: targetMinutes * 60 });
		}
	}

	const progress = timerMode === "countdown" && targetMinutes > 0
		? ((targetMinutes * 60 - timerSeconds) / (targetMinutes * 60)) * 100
		: 0;

	// On mobile/tablet, this is an overlay
	if (isMobile || isTablet) {
		return (
			<div className="fixed inset-0 z-50 flex">
				<div className="flex-1 bg-black/50 backdrop-blur-md" onClick={onClose} />
				<div className={`${isMobile ? "w-full" : "w-[340px]"} bg-[#121218] border-l border-white/10 flex flex-col shadow-2xl shadow-black/40 overflow-y-auto`}>
					<div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
						<button type="button" onClick={onClose} className="text-sm text-white/40 hover:text-white/70 transition-colors">
							← Back
						</button>
						<p className="text-xs text-white/50 font-medium">Panel</p>
					</div>
					<div className="flex-1 p-4 space-y-3 overflow-y-auto">
						<PanelContent
							projectProgress={projectProgress}
							overdue={overdue}
							upcoming={upcoming}
							timerSeconds={timerSeconds}
							timerMode={timerMode}
							pomodoroRunning={pomodoroRunning}
							progress={progress}
							targetMinutes={targetMinutes}
							onToggleMode={handleToggleMode}
							onStart={handleStart}
							onPause={handlePause}
							onReset={handleReset}
							onSetMinutes={handleSetMinutes}
						/>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-[220px] shrink-0 flex flex-col gap-3">
			<PanelContent
				projectProgress={projectProgress}
				overdue={overdue}
				upcoming={upcoming}
				timerSeconds={timerSeconds}
				timerMode={timerMode}
				pomodoroRunning={pomodoroRunning}
				progress={progress}
				targetMinutes={targetMinutes}
				onToggleMode={handleToggleMode}
				onStart={handleStart}
				onPause={handlePause}
				onReset={handleReset}
				onSetMinutes={handleSetMinutes}
			/>
		</div>
	);
}

function PanelContent({
	projectProgress, overdue, upcoming, timerSeconds, timerMode,
	pomodoroRunning, progress, targetMinutes,
	onToggleMode, onStart, onPause, onReset, onSetMinutes,
}: {
	projectProgress: number;
	overdue: number;
	upcoming: number;
	timerSeconds: number;
	timerMode: "countdown" | "stopwatch";
	pomodoroRunning: boolean;
	progress: number;
	targetMinutes: number;
	onToggleMode: () => void;
	onStart: () => void;
	onPause: () => void;
	onReset: () => void;
	onSetMinutes: (mins: number) => void;
}) {
	return (
		<>
			<GlassPanel className="p-4">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-1">Project</p>
				<p className="text-sm font-semibold text-white">Work</p>
				<div className="mt-3">
					<div className="flex items-center justify-between mb-1.5">
						<p className="text-[10px] text-white/40">Progress</p>
						<p className="text-[10px] text-white/60 font-medium">{projectProgress}%</p>
					</div>
					<div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
						<div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${projectProgress}%` }} />
					</div>
				</div>
			</GlassPanel>

			<GlassPanel className="p-4">
				<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2">Team</p>
				<div className="flex items-center gap-1.5">
					<div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">A</div>
					<div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white -ml-2 border-2 border-[#0a0a0f]/50">M</div>
					<span className="text-xs text-white/50 ml-1">Alex, Maria</span>
				</div>
			</GlassPanel>

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

			<GlassPanel className="p-4">
				<div className="flex items-center justify-between mb-3">
					<p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">
						{timerMode === "countdown" ? "Timer" : "Stopwatch"}
					</p>
					<button type="button" onClick={onToggleMode}
						className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
						{timerMode === "countdown" ? "Stopwatch →" : "← Timer"}
					</button>
				</div>
				<div className="text-center mb-4">
					<p className="text-3xl font-bold text-white font-mono tracking-wider">{formatTime(timerSeconds)}</p>
					{timerMode === "countdown" && <p className="text-[10px] text-white/30 mt-1">{targetMinutes} min target</p>}
				</div>
				{timerMode === "countdown" && (
					<div className="h-1 rounded-full bg-white/5 overflow-hidden mb-4">
						<div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
					</div>
				)}
				{timerMode === "countdown" && !pomodoroRunning && (
					<div className="flex items-center gap-2 mb-4">
						<input type="number" min="1" max="180" value={targetMinutes}
							onChange={(e) => { const val = Math.max(1, Number(e.target.value) || 1); onSetMinutes(val); }}
							className="w-16 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-center text-xs text-white font-mono outline-none focus:border-white/20 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
						<span className="text-[10px] text-white/40">min</span>
					</div>
				)}
				<div className="flex gap-2">
					<button type="button" onClick={pomodoroRunning ? onPause : onStart}
						className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-150
							${pomodoroRunning
								? "bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
								: "bg-white/10 border border-white/20 text-white hover:bg-white/15"
							}`}
					>
						{pomodoroRunning ? "Pause" : "Start"}
					</button>
					<button type="button" onClick={onReset}
						className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/40 hover:text-white/70 hover:bg-white/10 transition-all duration-150">
						Reset
					</button>
				</div>
			</GlassPanel>
		</>
	);
}
