import { useEffect } from "react";
import { useStore } from "../store/useStore";

const CHECK_INTERVAL = 60_000; // 60s
const WINDOW_MS = 5 * 60 * 1000; // next 5 minutes

export function useNotifications() {
	const notificationPermission = useStore((s) => s.notificationPermission);
	const notifiedCardIds = useStore((s) => s.notifiedCardIds);

	useEffect(() => {
		if (notificationPermission !== "granted") return;

		function check() {
			const state = useStore.getState()
			const uid = state.currentUserId
			if (!uid) return
			const board = state.boards[`board-${uid}`]
			if (!board) return

			const now = Date.now()
			const notified = state.notifiedCardIds

			Object.values(board.cards).forEach((card) => {
				if (card.completedAt) return
				if (!card.dueDate) return

				// Build full datetime from dueDate + dueTime (default 23:59)
				const time = card.dueTime ?? "23:59"
				const dueMs = new Date(`${card.dueDate}T${time}`).getTime()

				// Due within next 5 min and not already notified in last 5 min
				if (dueMs <= now || dueMs > now + WINDOW_MS) return
				const lastNotified = notified[card.id]
				if (lastNotified && now - new Date(lastNotified).getTime() < WINDOW_MS) return

				new Notification("Task due soon", {
					body: `"${card.title}" is due at ${time}`,
					icon: "/favicon.ico",
				})

				// Track notification time
				useStore.setState((s) => ({
					notifiedCardIds: { ...s.notifiedCardIds, [card.id]: new Date().toISOString() },
				}))
			})
		}

		check()
		const interval = setInterval(check, CHECK_INTERVAL)
		return () => clearInterval(interval)
	}, [notificationPermission, notifiedCardIds])
}
