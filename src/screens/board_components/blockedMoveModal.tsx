import type { Card } from "../../types/board.types";
import Modal from "../../components/Modal";

interface Props {
	card: Card;
	reason: "done" | "overdue" | "backward" | "not-started";
	onDismiss: () => void;
}

const REASON_MESSAGES: Record<Props["reason"], string> = {
	done: "This card is finished and lives in Done. Uncheck a task first if you need to move it elsewhere.",
	overdue:
		"This card has a stale, unfinished task and belongs in Backlog until that task is resolved.",
	backward:
		"This card has some unfinished tasks and belongs in In Progress and those can't be undone.",
	"not-started":
		"This card has a stale, unfinished task and belongs in Backlog until that task is resolved.",
};

export default function BlockedMoveModal({ card, reason, onDismiss }: Props) {
	return (
		<Modal titleId="blocked-move-title" onClose={onDismiss}>
			<h3 id="blocked-move-title" className="text-sm font-semibold text-fg mb-1">
				Can't move "{card.title}"
			</h3>
			<p className="text-xs text-muted mb-4">{REASON_MESSAGES[reason]}</p>

			<button
				type="button"
				data-autofocus
				onClick={onDismiss}
				className="w-full text-xs font-medium rounded-lg px-3 py-2 bg-primary text-on-primary hover:bg-primary-hover transition"
			>
				Got it
			</button>
		</Modal>
	);
}
