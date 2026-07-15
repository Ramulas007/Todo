import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import List from "./List";
import { useStore } from "../../store/useStore";
import useCardMoveGuard from "../../hooks/useCardMoveGuard";
import ConfirmMoveModal from "./confirmMoveModal";
import TaskCompletionModal from "./taskCompletionModal";
import BlockedMoveModal from "./blockedMoveModal";

export default function Board() {
	const board = useStore((s) => s.getBoard());
	const completeTask = useStore((s) => s.completeTask);
	const moveCard = useStore((s) => s.moveCard);

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

	// First card of "To Do" is open by default
	const [openCardId, setOpenCardId] = useState<string | number | null>(
		board?.lists.find((l) => l.id === "list-1")?.cardIds[0] ?? null,
	);

	function toggleCard(cardId: string | number) {
		setOpenCardId((prev) => (prev === cardId ? null : cardId));
	}

	if (!board) {
		return (
			<div className="flex items-center justify-center py-20 text-slate-500">
				Loading board...
			</div>
		);
	}

	return (
		<>
			<DragDropProvider onDragEnd={handleDragEnd}>
				<div className="flex gap-5 overflow-x-auto items-start pb-6 px-6 py-8">
					{board.lists.map((list) => {
						const listCards = list.cardIds
							.map((id) => board.cards[id])
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
