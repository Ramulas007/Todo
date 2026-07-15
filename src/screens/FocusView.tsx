import { useStore } from "../store/useStore";
import type { usePomodoro } from "../hooks/usePomodoro";

interface Props {
	onBack: () => void;
	pomodoro: ReturnType<typeof usePomodoro>;
}

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusView({ onBack, pomodoro }: Props) {
	const logTime = useStore((s) => s.logTime);
	const board = useStore((s) => s.getBoard());

	const card = pomodoro.cardId ? board?.cards[pomodoro.cardId] : null;

	function handleStop() {
		const result = pomodoro.stopFocus();
		if (result.cardId && result.minutes > 0) {
			logTime(result.cardId, {
				date: new Date().toISOString(),
				duration: result.minutes,
				description: `Focus session (${result.sessions} pomodoros)`,
				source: "pomodoro",
			});
		}
		onBack();
	}

	const circumference = 2 * Math.PI * 120;
	const dashOffset = circumference - (pomodoro.progress / 100) * circumference;

	const isBreak = pomodoro.state === "break" || pomodoro.state === "long-break";
	const stateLabel = {
		idle: "Ready to focus",
		running: "Focusing",
		paused: "Paused",
		break: "Short break",
		"long-break": "Long break",
	}[pomodoro.state];

	return (
		<div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col items-center justify-center relative">
			{/* Top bar */}
			<div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
				<h1 className="text-lg font-semibold text-white">Focus Mode</h1>
				<button
					type="button"
					onClick={handleStop}
					className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:border-white/[0.12] transition-all duration-150"
				>
					Exit Focus
				</button>
			</div>

			{/* Timer circle */}
			<div className="relative mb-8">
				<svg width="260" height="260" viewBox="0 0 260 260" className="-rotate-90">
					<circle
						cx="130" cy="130" r="115"
						fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6"
					/>
					<circle
						cx="130" cy="130" r="115"
						fill="none"
						stroke={isBreak ? "#10b981" : "#6366f1"}
						strokeWidth="6"
						strokeDasharray={circumference}
						strokeDashoffset={dashOffset}
						strokeLinecap="round"
						className="transition-all duration-1000"
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-5xl font-bold text-white tracking-tight font-mono">
						{formatTime(pomodoro.seconds)}
					</span>
					<span className="text-sm text-slate-500 mt-2">{stateLabel}</span>
				</div>
			</div>

			{/* Card info */}
			{card && (
				<div className="text-center mb-8">
					<p className="text-lg font-semibold text-white">{card.title}</p>
					{card.priority && (
						<span className={`text-xs font-medium capitalize mt-1 inline-block ${card.priority === "urgent" ? "text-rose-400" : card.priority === "high" ? "text-amber-400" : "text-slate-400"}`}>
							{card.priority} priority
						</span>
					)}
				</div>
			)}

			{/* Session counter */}
			<div className="flex items-center gap-2 mb-8">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className={`w-3 h-3 rounded-full transition-all duration-300 ${
							i < pomodoro.sessionCount % 4
								? "bg-indigo-500"
								: i === pomodoro.sessionCount % 4 && pomodoro.state === "running"
								? "bg-indigo-500/30 ring-2 ring-indigo-500/50"
								: "bg-white/10"
						}`}
					/>
				))}
				<span className="text-xs text-slate-500 ml-2">
					Session {(pomodoro.sessionCount % 4) + 1}/4
				</span>
			</div>

			{/* Controls */}
			<div className="flex items-center gap-3">
				{pomodoro.state === "idle" && (
					<button
						type="button"
						onClick={() => {
							if (pomodoro.cardId && card) {
								pomodoro.startFocus(pomodoro.cardId, card.title);
							}
						}}
						disabled={!pomodoro.cardId}
						className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white transition-all duration-150 hover:bg-indigo-400 disabled:opacity-40"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z"/>
						</svg>
					</button>
				)}

				{pomodoro.state === "running" && (
					<>
						<button
							type="button"
							onClick={pomodoro.pauseFocus}
							className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 transition-all duration-150 hover:bg-amber-500/25"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
							</svg>
						</button>
						<button
							type="button"
							onClick={handleStop}
							className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-rose-400 transition-all duration-150"
						>
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
								<rect x="6" y="6" width="12" height="12" rx="2"/>
							</svg>
						</button>
					</>
				)}

				{pomodoro.state === "paused" && (
					<>
						<button
							type="button"
							onClick={pomodoro.resumeFocus}
							className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white transition-all duration-150 hover:bg-indigo-400"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<path d="M8 5v14l11-7z"/>
							</svg>
						</button>
						<button
							type="button"
							onClick={handleStop}
							className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-rose-400 transition-all duration-150"
						>
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
								<rect x="6" y="6" width="12" height="12" rx="2"/>
							</svg>
						</button>
					</>
				)}

				{(pomodoro.state === "break" || pomodoro.state === "long-break") && (
					<>
						<button
							type="button"
							onClick={pomodoro.skipBreak}
							className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 transition-all duration-150 hover:bg-emerald-500/25"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
								<path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</button>
						<button
							type="button"
							onClick={handleStop}
							className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-rose-400 transition-all duration-150"
						>
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
								<rect x="6" y="6" width="12" height="12" rx="2"/>
							</svg>
						</button>
					</>
				)}
			</div>

			{/* Hint */}
			{!pomodoro.cardId && (
				<p className="text-sm text-slate-500 mt-8">
					Go to the board and click "Start Focus" on a card to begin.
				</p>
			)}
		</div>
	);
}