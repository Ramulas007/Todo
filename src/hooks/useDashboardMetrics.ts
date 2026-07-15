import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import type { CardEvent } from '../types/board.types'

// ─── Time helpers ────────────────────────────────────────────────────
function getDayOfWeek(date: string) {
	return new Date(date).getDay() // 0=Sun, 1=Mon, ...
}

function isWithinDays(dateStr: string, days: number) {
	const date = new Date(dateStr)
	const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
	return date >= cutoff
}

// ─── Dashboard metrics type ──────────────────────────────────────────
export interface DashboardMetrics {
	completionRate: number
	totalCards: number
	doneCards: number
	inProgressCards: number
	todoCards: number
	backlogCards: number

	// Velocity: cards completed in last 7 days
	velocity: number
	velocityDelta: number // % change vs prior 7 days

	// On-time rate
	onTimeRate: number
	avgTimeToComplete: string

	// Weekly activity (Mon-Sun)
	weeklyActivity: { label: string; value: number }[]

	// Trend line (last 14 days)
	trendLine: number[]

	// Pipeline health (maps to actual list names)
	pipelineHealth: { label: string; value: number; tone: string }[]

	// Recent activity
	recentActivity: { text: string; time: string; color: string }[]

	// Quick action tip
	quickActionTip: string

	// Empty states
	isEmpty: boolean
}

// ─── Selector hook ───────────────────────────────────────────────────
export function useDashboardMetrics(ownerId?: string): DashboardMetrics {
	const getCards = useStore((s) => s.getCards)
	const getBoard = useStore((s) => s.getBoard)

	const cards = useMemo(() => getCards(ownerId), [getCards, ownerId])
	const board = useMemo(() => getBoard(ownerId), [getBoard, ownerId])

	return useMemo(() => {
		if (!cards.length || !board) {
			return {
				completionRate: 0, totalCards: 0, doneCards: 0,
				inProgressCards: 0, todoCards: 0, backlogCards: 0,
				velocity: 0, velocityDelta: 0,
				onTimeRate: 0, avgTimeToComplete: '—',
				weeklyActivity: [
					{ label: 'Mon', value: 0 }, { label: 'Tue', value: 0 },
					{ label: 'Wed', value: 0 }, { label: 'Thu', value: 0 },
					{ label: 'Fri', value: 0 }, { label: 'Sat', value: 0 },
					{ label: 'Sun', value: 0 },
				],
				trendLine: Array(14).fill(0),
				pipelineHealth: board?.lists.map((l) => ({
					label: l.title, value: 0, tone: 'bg-slate-400',
				})) ?? [],
				recentActivity: [],
				quickActionTip: 'No cards yet — create your first task to get started.',
				isEmpty: true,
			}
		}

		// ─── Card counts per list ─────────────────────────────────────
		const listCardCounts: Record<string, number> = {}
		board.lists.forEach((l) => { listCardCounts[l.id] = 0 })

		cards.forEach((card) => {
			const listId = board.lists.find((l) => l.cardIds.includes(card.id))?.id
			if (listId && listCardCounts[listId] !== undefined) {
				listCardCounts[listId]++
			}
		})

		const doneListId = board.lists.find((l) => l.title === 'Done')?.id ?? 'list-3'
		const inProgressListId = board.lists.find((l) => l.title === 'In Progress')?.id ?? 'list-2'
		const todoListId = board.lists.find((l) => l.title === 'To Do')?.id ?? 'list-1'
		const backlogListId = board.lists.find((l) => l.title === 'Backlog')?.id ?? 'list-4'

		const doneCards = listCardCounts[doneListId] ?? 0
		const inProgressCards = listCardCounts[inProgressListId] ?? 0
		const todoCards = listCardCounts[todoListId] ?? 0
		const backlogCards = listCardCounts[backlogListId] ?? 0
		const totalCards = cards.length
		const completionRate = totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0

		// ─── Velocity (cards completed in last 7 days) ───────────────
		const recent7 = cards.filter((c) => c.completedAt && isWithinDays(c.completedAt, 7))
		const prior7 = cards.filter((c) => c.completedAt && isWithinDays(c.completedAt, 14) && !isWithinDays(c.completedAt, 7))
		const velocity = recent7.length
		const velocityDelta = prior7.length > 0
			? Math.round(((velocity - prior7.length) / prior7.length) * 100)
			: velocity > 0 ? 100 : 0

		// ─── On-time rate ────────────────────────────────────────────
		const completedWithDue = cards.filter((c) => c.completedAt && c.dueDate)
		const onTime = completedWithDue.filter((c) => new Date(c.completedAt!) <= new Date(c.dueDate!))
		const onTimeRate = completedWithDue.length > 0
			? Math.round((onTime.length / completedWithDue.length) * 100)
			: 0

		// ─── Avg time to complete ────────────────────────────────────
		const completedWithTimestamps = cards.filter((c) => c.completedAt && c.createdAt)
		if (completedWithTimestamps.length > 0) {
			const totalMs = completedWithTimestamps.reduce((sum, c) => {
				return sum + (new Date(c.completedAt!).getTime() - new Date(c.createdAt).getTime())
			}, 0)
			const avgMs = totalMs / completedWithTimestamps.length
			const avgDays = Math.round(avgMs / (24 * 60 * 60 * 1000))
			var avgTimeToComplete = avgDays === 0 ? '< 1 day' : `${avgDays}d`
		} else {
			var avgTimeToComplete = '—'
		}

		// ─── Weekly activity (last 7 days, bucketed by day-of-week) ──
		const weeklyBuckets = Array(7).fill(0)

		cards.forEach((card) => {
			card.history.forEach((event) => {
				if (isWithinDays(event.timestamp, 7)) {
					const day = getDayOfWeek(event.timestamp)
					// Reorder to Mon-Sun
					const idx = day === 0 ? 6 : day - 1
					weeklyBuckets[idx]++
				}
			})
		})

		const weeklyActivity = [
			{ label: 'Mon', value: weeklyBuckets[1] },
			{ label: 'Tue', value: weeklyBuckets[2] },
			{ label: 'Wed', value: weeklyBuckets[3] },
			{ label: 'Thu', value: weeklyBuckets[4] },
			{ label: 'Fri', value: weeklyBuckets[5] },
			{ label: 'Sat', value: weeklyBuckets[6] },
			{ label: 'Sun', value: weeklyBuckets[0] },
		]

		// ─── Trend line (last 14 days, completions per day) ──────────
		const trendLine = Array(14).fill(0)
		cards.forEach((card) => {
			if (card.completedAt) {
				const daysSince = Math.floor(
					(Date.now() - new Date(card.completedAt).getTime()) / (24 * 60 * 60 * 1000),
				)
				if (daysSince >= 0 && daysSince < 14) {
					trendLine[13 - daysSince]++
				}
			}
		})

		// ─── Pipeline health (dynamic labels from actual lists) ──────
		const pipelineTones: Record<string, string> = {
			'To Do': 'bg-cyan-400',
			'In Progress': 'bg-amber-400',
			'Done': 'bg-emerald-400',
			'Backlog': 'bg-violet-400',
		}

		const pipelineHealth = board.lists.map((l) => {
			const count = listCardCounts[l.id] ?? 0
			const pct = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0
			return {
				label: l.title,
				value: pct,
				tone: pipelineTones[l.title] ?? 'bg-slate-400',
			}
		})

		// ─── Recent activity (last 5 events across all cards) ────────
		const allEvents: (CardEvent & { cardTitle: string })[] = []
		cards.forEach((card) => {
			card.history.forEach((event) => {
				allEvents.push({ ...event, cardTitle: card.title })
			})
		})
		allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

		const eventColors: Record<string, string> = {
			completed: 'bg-emerald-400',
			moved: 'bg-amber-400',
			created: 'bg-blue-400',
			task_completed: 'bg-emerald-400',
			edited: 'bg-slate-400',
		}

		const recentActivity = allEvents.slice(0, 5).map((event) => {
			const msAgo = Date.now() - new Date(event.timestamp).getTime()
			const hoursAgo = Math.floor(msAgo / (1000 * 60 * 60))
			const time = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`

			let text = ''
			switch (event.type) {
				case 'completed':
					text = `Completed "${event.cardTitle}"`
					break
				case 'moved':
					text = `Moved card to ${event.toListId ?? 'list'}`
					break
				case 'created':
					text = `Created "${event.cardTitle}"`
					break
				case 'task_completed':
					text = event.description ?? `Completed a task in "${event.cardTitle}"`
					break
				case 'edited':
					text = `Edited "${event.cardTitle}"`
					break
			}

			return { text, time, color: eventColors[event.type] ?? 'bg-slate-400' }
		})

		// ─── Quick action tip ────────────────────────────────────────
		const highPriority = cards.filter((c) => c.priority === 'high' || c.priority === 'urgent')
		const overdue = cards.filter((c) => c.dueDate && new Date(c.dueDate) < new Date() && !c.completedAt)
		let quickActionTip: string
		if (overdue.length > 0) {
			quickActionTip = `You have ${overdue.length} overdue card${overdue.length > 1 ? 's' : ''} — focus on those first.`
		} else if (highPriority.length > 0 && todoCards > 0) {
			quickActionTip = `${highPriority.length} high-priority card${highPriority.length > 1 ? 's' : ''} in To Do.`
		} else if (inProgressCards > 3) {
			quickActionTip = `${inProgressCards} cards in progress — try to finish before starting new ones.`
		} else {
			quickActionTip = 'Nothing urgent — nice work. Keep the momentum going.'
		}

		return {
			completionRate,
			totalCards,
			doneCards,
			inProgressCards,
			todoCards,
			backlogCards,
			velocity,
			velocityDelta,
			onTimeRate,
			avgTimeToComplete,
			weeklyActivity,
			trendLine,
			pipelineHealth,
			recentActivity,
			quickActionTip,
			isEmpty: false,
		}
	}, [cards, board])
}