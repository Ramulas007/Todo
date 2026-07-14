import { useState, useMemo, useCallback } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import List from "./List";
import BoardToolbar from "./BoardToolbar";
import ShortcutsHelp from "./ShortcutsHelp";
import { useStore } from "../../store/useStore";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import useCardMoveGuard from "../../hooks/useCardMoveGuard";
import type { Priority } from "../../types/board.types";
import ConfirmMoveModal from "./confirmMoveModal";
import TaskCompletionModal from "./taskCompletionModal";
import BlockedMoveModal from "./blockedMoveModal";

export default function Board() {
	const board = useStore((s) => s.getBoard());
	const completeTask = useStore((s) => s.completeTask);
	const moveCard = useStore((s) => s.moveCard);
	const undo = useStore((s) => s.undo);
	const redo = useStore((s) => s.redo);

	const {
		handleDragEnd,
		pendingCompletion,
		pendingConfirm,
		confirmCompletion,
		cancelCompletion,
		confirmBacklogMove,
		cancelBacklogMove,
		blockedMove,
		dismissBlockedMove,
	} = useCardMoveGuard(board, moveCard);

	// Filter state
	const [searchQuery, setSearchQuery] = useState("");
	const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
	const [dueDateFilter, setDueDateFilter] = useState<"overdue" | "today" | "week" | null>(null);

	// First card of "To Do" is open by default
	const [openCardId, setOpenCardId] = useState<string | number | null>(
		board?.lists.find((l) => l.id === "list-1")?.cardIds[0] ?? null,
	);

	// Shortcuts help
	const [showShortcuts, setShowShortcuts] = useState(false);

	function toggleCard(cardId: string | number) {
		setOpenCardId((prev) => (prev === cardId ? null : cardId));
	}

	function clearFilters() {
		setSearchQuery("");
		setPriorityFilter(null);
		setDueDateFilter(null);
	}

	// Focus search
	const focusSearch = useCallback(() => {
		const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
		searchInput?.focus();
	}, []);

	// Keyboard shortcuts
	useKeyboardShortcuts([
		{ key: "k", ctrl: true, action: focusSearch, description: "Focus search" },
		{ key: "z", ctrl: true, action: undo, description: "Undo" },
		{ key: "z", ctrl: true, shift: true, action: redo, description: "Redo" },
		{ key: "y", ctrl: true, action: redo, description: "Redo" },
		{ key: "?", action: () => setShowShortcuts(true), description: "Show shortcuts" },
		{ key: "Escape", action: () => { setShowShortcuts(false); clearFilters(); }, description: "Close/clear" },
	]);

	// Filter cards
	const filteredBoard = useMemo(() => {
		if (!board) return null;
		if (!searchQuery && !priorityFilter && !dueDateFilter) return board;

		const now = new Date();
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const weekEnd = new Date(todayStart);
		weekEnd.setDate(weekEnd.getDate() + 7);

		const filteredCards: Record<string, any> = {};

		Object.entries(board.cards).forEach(([id, card]) => {
			let pass = true;

			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				const matchesTitle = card.title.toLowerCase().includes(q);
				const matchesDesc = card.description.toLowerCase().includes(q);
				const matchesTags = card.tags?.some((t) => t.toLowerCase().includes(q));
				if (!matchesTitle && !matchesDesc && !matchesTags) pass = false;
			}

			if (priorityFilter && card.priority !== priorityFilter) pass = false;

			if (dueDateFilter && card.dueDate) {
				const due = new Date(card.dueDate);
				if (dueDateFilter === "overdue" && due >= todayStart) pass = false;
				if (dueDateFilter === "today" && (due < todayStart || due >= weekEnd)) pass = false;
				if (dueDateFilter === "week" && (due < todayStart || due >= weekEnd)) pass = false;
			} else if (dueDateFilter) {
				pass = false;
			}

			if (pass) filteredCards[id] = card;
		});

		return {
			...board,
			cards: filteredCards,
			lists: board.lists.map((l) => ({
				...l,
				cardIds: l.cardIds.filter((id) => filteredCards[id]),
			})),
		};
	}, [board, searchQuery, priorityFilter, dueDateFilter]);

	if (!board) {
		return (
			<div className="flex items-center justify-center py-20 text-slate-500">
				Loading board...
			</div>
		);
	}

	const displayBoard = filteredBoard ?? board;

	return (
		<>
			{/* Toolbar */}
			<BoardToolbar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				priorityFilter={priorityFilter}
				onPriorityFilterChange={setPriorityFilter}
				dueDateFilter={dueDateFilter}
				onDueDateFilterChange={setDueDateFilter}
				onClearFilters={clearFilters}
			/>

			{/* Board */}
			<DragDropProvider onDragEnd={handleDragEnd}>
				<div className="flex gap-5 overflow-x-auto items-start pb-6 px-6 py-8">
					{displayBoard.lists.map((list) => {
						const listCards = list.cardIds
							.map((id) => displayBoard.cards[id])
							.filter(Boolean)
							.sort((a, b) => a.position - b.position);

						const totalDone = listCards.reduce(
							(sum, card) =>
								sum + card.tasks.filter((t) => t.isCompleted).length,
							0,
						);

						return (
							<List
								key={list.id}
								list={list}
								cards={listCards}
								totalDone={totalDone}
								openCardId={openCardId}
								onToggleCard={toggleCard}
							/>
						);
					})}
				</div>
			</DragDropProvider>

			{/* Shortcuts help */}
			{showShortcuts && (
				<ShortcutsHelp onClose={() => setShowShortcuts(false)} />
			)}

			{/* Modals */}
			{pendingCompletion && board.cards[pendingCompletion.cardId] && (
				<TaskCompletionModal
					card={board.cards[pendingCompletion.cardId]}
					onCompleteTask={completeTask}
					onCancel={cancelCompletion}
					onConfirm={confirmCompletion}
				/>
			)}

			{pendingConfirm && board.cards[pendingConfirm.cardId] && (
				<ConfirmMoveModal
					card={board.cards[pendingConfirm.cardId]}
					message="Move this card to Backlog? It hasn't been finished."
					onCancel={cancelBacklogMove}
					onConfirm={confirmBacklogMove}
				/>
			)}

			{blockedMove && board.cards[blockedMove.cardId] && (
				<BlockedMoveModal
					card={board.cards[blockedMove.cardId]}
					reason={blockedMove.reason}
					onDismiss={dismissBlockedMove}
				/>
			)}
		</>
	);
}
