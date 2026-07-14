import type { Card } from "../../types/board.types";
import Modal from "../../components/Modal";

interface Props {
	card: Card;
	message: string;
	onCancel: () => void;
	onConfirm: () => void;
}

export default function ConfirmMoveModal({
	card,
	message,
	onCancel,
	onConfirm,
}: Props) {
	return (
		<Modal titleId="confirm-move-title" onClose={onCancel}>
			<h3 id="confirm-move-title" className="text-sm font-semibold text-fg mb-1">
				{card.title}
			</h3>
			<p className="text-xs text-muted mb-4">{message}</p>

			<div className="flex gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="flex-1 text-xs font-medium rounded-lg px-3 py-2 border border-line-strong text-muted hover:bg-surface-2 transition"
				>
					Cancel
				</button>
				<button
					type="button"
					data-autofocus
					onClick={onConfirm}
					className="flex-1 text-xs font-medium rounded-lg px-3 py-2 bg-primary text-on-primary hover:bg-primary-hover transition"
				>
					Yes, move it
				</button>
			</div>
		</Modal>
	);
}
