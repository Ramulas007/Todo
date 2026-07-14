import type { Card } from "../../types/board.types";
import Modal from "../../components/Modal";

interface Props {
	card: Card;
	onCompleteTask: (cardId: string | number, taskId: string | number) => void;
	onCancel: () => void;
	onConfirm: () => void;
}

export default function TaskCompletionModal({
	card,
	onCompleteTask,
	onCancel,
	onConfirm,
}: Props) {
	const total = card.tasks.length;
	const done = card.tasks.filter((t) => t.isCompleted).length;
	const allDone = total === 0 || done === total;

	return (
		<Modal titleId="task-completion-title" onClose={onCancel}>
			<h3
				id="task-completion-title"
				className="text-sm font-semibold text-fg mb-1"
			>
				Finish "{card.title}" first
			</h3>
			<p className="text-xs text-muted mb-4">
				All tasks need to be checked off before this card can move to Done.
			</p>

			{total > 0 && (
				<div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
					{card.tasks.map((task) => (
						<label
							key={task.id}
							className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border
              ${
								task.isCompleted
									? "border-success/30 bg-success-soft text-success"
									: "border-line bg-surface-2 text-muted"
							}`}
						>
							<input
								type="checkbox"
								checked={task.isCompleted}
								disabled={task.isCompleted}
								onChange={() => onCompleteTask(card.id, task.id)}
								className="accent-[var(--primary)]"
							/>
							<span className={task.isCompleted ? "line-through" : ""}>
								{task.title}
							</span>
						</label>
					))}
				</div>
			)}

			<div className="flex gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="flex-1 text-xs font-medium rounded-lg px-3 py-2 border border-line-strong text-muted hover:bg-surface-2 transition"
				>
					Back to previous list
				</button>
				<button
					type="button"
					data-autofocus
					onClick={onConfirm}
					disabled={!allDone}
					className={`flex-1 text-xs font-medium rounded-lg px-3 py-2 transition
          ${
						allDone
							? "bg-success text-white hover:opacity-90"
							: "bg-surface-2 text-subtle cursor-not-allowed"
					}`}
				>
					Move to Done
				</button>
			</div>
		</Modal>
	);
}
