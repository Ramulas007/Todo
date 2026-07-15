import { useState, useEffect, useRef, useCallback } from "react";

export type TimerState = "idle" | "running" | "paused" | "break" | "long-break";

interface PomodoroState {
	state: TimerState;
	seconds: number;
	sessionCount: number;
	totalSeconds: number;
	cardId: string | null;
	cardTitle: string | null;
}

function playNotificationSound() {
	try {
		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.frequency.value = 800;
		gain.gain.value = 0.3;
		osc.start();
		setTimeout(() => { osc.frequency.value = 1000; }, 150);
		setTimeout(() => { osc.frequency.value = 800; }, 300);
		setTimeout(() => { osc.stop(); ctx.close(); }, 500);
	} catch {}
}

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const LONG_BREAK_SECONDS = 15 * 60;

export function usePomodoro() {
	const [pomodoro, setPomodoro] = useState<PomodoroState>({
		state: "idle",
		seconds: WORK_SECONDS,
		sessionCount: 0,
		totalSeconds: WORK_SECONDS,
		cardId: null,
		cardTitle: null,
	});

	// Use ref for latest state to avoid stale closures in interval
	const pomodoroRef = useRef(pomodoro);
	pomodoroRef.current = pomodoro;

	const intervalRef = useRef<number | null>(null);

	const clearTimer = useCallback(() => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (pomodoro.state === "running" || pomodoro.state === "break" || pomodoro.state === "long-break") {
			intervalRef.current = window.setInterval(() => {
				setPomodoro((prev) => {
					if (prev.seconds <= 1) {
						playNotificationSound();
						if (prev.state === "running") {
							const newCount = prev.sessionCount + 1;
							if (newCount % 4 === 0) {
								return {
									...prev,
									state: "long-break",
									seconds: LONG_BREAK_SECONDS,
									totalSeconds: LONG_BREAK_SECONDS,
									sessionCount: newCount,
								};
							}
							return {
								...prev,
								state: "break",
								seconds: BREAK_SECONDS,
								totalSeconds: BREAK_SECONDS,
								sessionCount: newCount,
							};
						}
						// Break finished → back to work
						return {
							...prev,
							state: "running",
							seconds: WORK_SECONDS,
							totalSeconds: WORK_SECONDS,
						};
					}
					return { ...prev, seconds: prev.seconds - 1 };
				});
			}, 1000);
		}

		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [pomodoro.state]);

	function startFocus(cardId: string, cardTitle: string) {
		clearTimer();
		setPomodoro({
			state: "running",
			seconds: WORK_SECONDS,
			totalSeconds: WORK_SECONDS,
			sessionCount: 0,
			cardId,
			cardTitle,
		});
	}

	function pauseFocus() {
		clearTimer();
		setPomodoro((prev) => ({ ...prev, state: "paused" }));
	}

	function resumeFocus() {
		setPomodoro((prev) => ({
			...prev,
			state: "running",
		}));
	}

	function skipBreak() {
		clearTimer();
		setPomodoro((prev) => ({
			...prev,
			state: "running",
			seconds: WORK_SECONDS,
			totalSeconds: WORK_SECONDS,
		}));
	}

	function stopFocus() {
		const current = pomodoroRef.current;
		const completedMinutes = Math.round(
			((current.totalSeconds - current.seconds) / 60)
		);
		const result = {
			cardId: current.cardId,
			minutes: completedMinutes,
			sessions: current.sessionCount,
		};
		clearTimer();
		setPomodoro({
			state: "idle",
			seconds: WORK_SECONDS,
			totalSeconds: WORK_SECONDS,
			sessionCount: 0,
			cardId: null,
			cardTitle: null,
		});
		return result;
	}

	const progress = pomodoro.totalSeconds > 0
		? ((pomodoro.totalSeconds - pomodoro.seconds) / pomodoro.totalSeconds) * 100
		: 0;

	return {
		...pomodoro,
		progress,
		startFocus,
		pauseFocus,
		resumeFocus,
		skipBreak,
		stopFocus,
		isActive: pomodoro.state !== "idle",
	};
}