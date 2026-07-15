import { useMemo } from "react";
import { useStore } from "../store/useStore";
import type { Card } from "../types/board.types";

export interface TodayCard extends Card {
	listName: string;
	score: number;
	reason: string;
}

function priorityWeight(p?: string): number {
	return { urgent: 4, high: 3, medium: 2, low: 1 }[p ?? "medium"] ?? 2;
}

function scoreCard(card: Card, listName: string): { score: number; reason: string } {
	const daysSinceUpdate = Math.floor(
		(Date.now() - new Date(card.updatedAt).getTime()) / 86400000
	);
	const isOverdue =
		card.dueDate && new Date(card.dueDate) < new Date() && !card.completedAt;
	const isDueToday =
		card.dueDate &&
		new Date(card.dueDate).toDateString() === new Date().toDateString() &&
		!card.completedAt;
	const hasIncompleteTasks = card.tasks.some((t) => !t.isCompleted);

	let score = 0;
	const reasons: string[] = [];

	score += priorityWeight(card.priority) * 3;
	if (card.priority === "urgent") reasons.push("Urgent priority");
	else if (card.priority === "high") reasons.push("High priority");

	score += Math.min(daysSinceUpdate, 10) * 0.5;
	if (daysSinceUpdate >= 3) reasons.push(`${daysSinceUpdate} days in ${listName}`);

	if (isOverdue) {
		score += 5;
		const daysOverdue = Math.floor(
			(Date.now() - new Date(card.dueDate!).getTime()) / 86400000
		);
		reasons.push(`Overdue by ${daysOverdue}d`);
	}

	if (isDueToday) {
		score += 3;
		reasons.push("Due today");
	}

	if (hasIncompleteTasks) {
		score += 1;
		reasons.push("Has subtasks");
	}

	return {
		score,
		reason: reasons[0] ?? `In ${listName}`,
	};
}

export function useTodayView() {
	const getBoard = useStore((s) => s.getBoard);
	const board = getBoard();

	return useMemo(() => {
		if (!board) {
			return {
				overdue: [] as TodayCard[],
				dueToday: [] as TodayCard[],
				suggested: [] as TodayCard[],
				completedToday: [] as TodayCard[],
				stats: { overdue: 0, dueToday: 0, suggested: 0, completedToday: 0 },
			};
		}

		const allCards = Object.values(board.cards);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayEnd = new Date(today);
		todayEnd.setDate(todayEnd.getDate() + 1);

		function getListName(cardId: string): string {
			return board.lists.find((l) => l.cardIds.includes(cardId))?.title ?? "Unknown";
		}

		function enrichCard(card: Card): TodayCard {
			const { score, reason } = scoreCard(card, getListName(card.id));
			return { ...card, listName: getListName(card.id), score, reason };
		}

		// Overdue: past due, not completed
		const overdue = allCards
			.filter(
				(c) =>
					c.dueDate &&
					new Date(c.dueDate) < today &&
					!c.completedAt
			)
			.map(enrichCard)
			.sort((a, b) => b.score - a.score);

		// Due today
		const dueToday = allCards
			.filter(
				(c) =>
					c.dueDate &&
					new Date(c.dueDate) >= today &&
					new Date(c.dueDate) < todayEnd &&
					!c.completedAt
			)
			.map(enrichCard)
			.sort((a, b) => b.score - a.score);

		// Suggested next: not overdue, not due today, not completed, scored by priority + age
		const suggested = allCards
			.filter(
				(c) =>
					!c.completedAt &&
					(!c.dueDate || new Date(c.dueDate) >= todayEnd)
			)
			.map(enrichCard)
			.sort((a, b) => b.score - a.score)
			.slice(0, 5);

		// Completed today
		const completedToday = allCards
			.filter(
				(c) =>
					c.completedAt &&
					new Date(c.completedAt) >= today &&
					new Date(c.completedAt) < todayEnd
			)
			.sort(
				(a, b) =>
					new Date(b.completedAt!).getTime() -
					new Date(a.completedAt!).getTime()
			);

		return {
			overdue,
			dueToday,
			suggested,
			completedToday,
			stats: {
				overdue: overdue.length,
				dueToday: dueToday.length,
				suggested: suggested.length,
				completedToday: completedToday.length,
			},
		};
	}, [board]);
}